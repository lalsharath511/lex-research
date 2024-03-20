# app.py

from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime,timedelta
import pytz
import requests
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from google.auth.transport.requests import Request
from dotenv import load_dotenv
from bson import Binary
import re
from similarity import TextMatcher
import json
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
# from openai import OpenAI
# from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA
# from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
# from langchain_community.document_loaders import JSONLoader
#from langchain.text_splitter import CharacterTextSplitter
#import json
from langchain_google_vertexai import VertexAI
# from langchain.prompts.chat import PromptTemplat




load_dotenv()
app = Flask(__name__)
#client_open_ai = OpenAI(api_key='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')
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'your_default_secret_key')
client = MongoClient("mongodb+srv://lalsharath511:Sharathbhagavan15192142@legal.mosm3f4.mongodb.net/")
db = client["lex_learn"]


api_key=os.environ.get('API_KEY', 'your_default_google_client_id')
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] =os.environ.get('GOOGLE_APPLICATION_CREDENTIALS') 

# Define the upload folder path
app.config['UPLOAD_FOLDER'] = 'static/info'

# Google client ID

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', 'your_default_google_client_id')

# Function to check if user is logged in
def is_logged_in():
     return "username" in session or "google_user_info" in session


def parse_llm_response(response):
    # Remove asterisks from the response
    response = response.replace('*', '')
    
    # Make certain sections bold
    sections_to_bold = ['Introduction:', 'Factual Background:', 'Legal Analysis:', 'Conclusion:', 'Proposal:']
    for section in sections_to_bold:
        response = response.replace(section, f'<b>{section}</b>')
    

 
    return response

# Routes

def llm_response(prompt):
    embedding_function = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectordb=Chroma(persist_directory="data" ,embedding_function=embedding_function)
    # create a ConversationalRetrievalChain object for PDF question answering
    llm = VertexAI(
        api_key=api_key,
        model_name="text-bison@001",
        max_output_tokens=1000,
        temperature=0.1,
        top_p=0.8,
        top_k=40,
        verbose=True,
    )

    template = """Insident: {question}
Find Indian act related to the Incident from the context and give a Professional Opinion on income tax using t>
Strictly Use ONLY the following pieces of context to answer the question at the end. Think step-by-step and th>

Do not try to make up an answer:
- If the answer to the question cannot be determined from the context alone, say "I cannot determine the answe>
- If the context is empty, just say "I do not know the answer to that."

============
{context}
============


If the user provides a direct question, I will provide a direct answer based solely on the provided context. O>

Helpful Answer example:    **Professional Opinion on Income Tax**

        1. **Introduction:**
        Provide an introduction outlining the purpose of the opinion and a brief summary of the issues to be a>

        2. **Factual Background:**
        Describe the relevant facts and circumstances surrounding the issue at hand. This is crucial for under>

        3. **Legal Analysis:**
        Perform a detailed analysis of the relevant provisions of the Indian Income Tax Act, along with any ap>

        4. **Conclusion:**
        Conclude with a clear and concise summary of the legal position and the recommended course of action b>

        5. **Proposal:**
        If applicable, provide recommendations for action or further steps that should be taken based on the a>
 """
    pdf_qa = RetrievalQA.from_chain_type(
        llm=llm,  # use GooglePalm for language modeling
        chain_type="stuff",
        retriever=vectordb.as_retriever(search_kwargs={'k':6}),  # use the Chroma vector store for document retrieval
        return_source_documents=True,  # return the source documents along with the answers
        verbose=False,  # do not print verbose output
            chain_type_kwargs={
            "prompt": PromptTemplate(
                template=template,
                input_variables=["context", "question"],
            ),
        },
    )
    result = pdf_qa({"query": prompt})
    response_text = result['result']
    parsed_response = parse_llm_response(response_text)
    
    # Print the parsed response
    print("Parsed Response:", parsed_response)
    
    return parsed_response

#  result=""" 
#  **Professional Opinion on Income Tax**

#     #         1. **Introduction:**
#     #         Provide an introduction outlining the purpose of the opinion and a brief summary of the issues to be addressed.

#     #         2. **Factual Background:**
#     #         Describe the relevant facts and circumstances surrounding the issue at hand. This is crucial for understanding the context in which the opinion is being sought.

#     #         3. **Legal Analysis:**
#     #         Perform a detailed analysis of the relevant provisions of the Income Tax Act, 1961, along with any applicable case law or judicial precedents. Tailor the analysis to the specific situation to provide a clear understanding of how the law applies.

#     #         4. **Conclusion:**
#     #         Conclude with a clear and concise summary of the legal position and the recommended course of action based on the analysis. This should be the key takeaway from the opinion.

#     #         5. **Proposal:**
#     #         If applicable, provide recommendations for action or further steps that should be taken based on the analysis and conclusion.

#     **Professional Opinion on Income Tax**

#     #         1. **Introduction:**
#     #         Provide an introduction outlining the purpose of the opinion and a brief summary of the issues to be addressed.

#     #         2. **Factual Background:**
#     #         Describe the relevant facts and circumstances surrounding the issue at hand. This is crucial for understanding the context in which the opinion is being sought.

#     #         3. **Legal Analysis:**
#     #         Perform a detailed analysis of the relevant provisions of the Income Tax Act, 1961, along with any applicable case law or judicial precedents. Tailor the analysis to the specific situation to provide a clear understanding of how the law applies.

#     #         4. **Conclusion:**
#     #         Conclude with a clear and concise summary of the legal position and the recommended course of action based on the analysis. This should be the key takeaway from the opinion.

#     #         5. **Proposal:**
#     #         If applicable, provide recommendations for action or further steps that should be taken based on the analysis and conclusion.

    

  
#  """
#  return result 
     
    

@app.route('/get_recommendation', methods=['POST'])
def get_recommendation():
    if is_logged_in():
        if "username" in session:  # Regular login user
            username = session['username']
        elif "google_user_info" in session:  # Google login user
            username = session['google_user_info']['email']
        else:
            return jsonify({'error': 'User not logged in'})
        
        
        situation = request.form.get('situation')

        recommendation = llm_response(situation)

        user_collection = db['users']
        current_date = datetime.now(pytz.utc)

        existing_query = user_collection.find_one(
            {'username': username, 'queries.question': situation},
            projection={'_id': False, 'queries.$': True}
        )

        if existing_query:
            user_collection.update_one(
                {'username': username, 'queries.question': situation},
                {
                    '$push': {'queries.$.response': recommendation},
                    '$setOnInsert': {'queries.$.like': False, 'queries.$.dislike': False, 'queries.$.feedback': ''},
                    '$set': {'queries.$.date': current_date}
                }
            )
        else:
            user_collection.update_one(
                {'username': username},
                {
                    '$push': {
                        'queries': {
                            'question': situation,
                            'response': [recommendation],
                            'like': False,
                            'dislike': False,
                            'feedback': '',
                            'date': current_date
                        }
                    }
                }
            )

        return jsonify({'recommendation': recommendation})
    else:
    
        flash('You are not logged in', 'danger')
        return redirect(url_for('login'))
    

# Google login route
@app.route('/login/google')
def google_login():
    # Redirect the user to Google's OAuth 2.0 authentication page
    redirect_uri = url_for('google_callback', _external=True)
    return redirect(f'https://accounts.google.com/o/oauth2/v2/auth?client_id={GOOGLE_CLIENT_ID}&redirect_uri={redirect_uri}&response_type=code&scope=email profile openid')


# Google login callback route
@app.route('/login/google/callback')
def google_callback():
    # Retrieve the authorization code from the URL query parameters
    code = request.args.get('code')

 

  flow = Flow.from_client_secrets_file(
    'demo/client_secret_356459053763-d1flmo4pfpakmu6oc36o75tjssoba24n.apps.googleusercontent.com.json',
    scopes=['openid', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    redirect_uri='http://lexresearch.lexres.co.in/login/google/callback'
)

    # Fetch tokens using the authorization code
    flow.fetch_token(code=code)

    # Get user information from the ID token
    credentials = flow.credentials
    id_info = id_token.verify_oauth2_token(credentials._id_token, Request(), credentials.client_id)

    # Retrieve the profile picture URL from the Google user information
    profile_picture_url = id_info.get('picture')

    # Download the profile picture and save it to a temporary location
    response = requests.get(profile_picture_url)
    if response.status_code == 200:
        picture_data = response.content
        picture_filename = os.path.join(app.config['UPLOAD_FOLDER'], 'profile_picture.jpg')
        with open(picture_filename, 'wb') as f:
            f.write(picture_data)
    
    # Here, you can save the user information along with the profile picture to MongoDB
    # Example assuming you have a 'users' collection
    user_collection = db['users']
    user_data = {
        'name': id_info['name'],
        'username': id_info['email'],  # Assuming the email is unique and used as the username
        'profile_picture': Binary(picture_data)  # Store the picture as Binary data
        # Add other user information as needed
    }
    user_collection.insert_one(user_data)

    # Store the user information in the session
    session['google_user_info'] = id_info

    # Redirect the user to the dashboard or other appropriate page
    return redirect(url_for('index'))

@app.route('/')
def index():
    if is_logged_in():
        if "username" in session:
            username = session['username']
        else:
            username = session.get('google_user_info').get('email')

       
      # Calculate the date two weeks ago
        two_weeks_ago = datetime.now() - timedelta(weeks=2)

        
        # Query the database for the user's query history
        user_collection = db['users']
        user_queries = user_collection.find_one({'username': username}, {'queries': 1})
        query_history = user_queries.get('queries', [])

# Delete queries older than two weeks
        user_collection.update_one({'username': username}, {'$pull': {'queries': {'date': {'$lt': two_weeks_ago}}}})

        # Filter queries to keep only those within the last two weeks
        query_history = [query for query in query_history if query.get('date') > two_weeks_ago]

        # Group queries by date and sort them
        grouped_queries = {}
        today = datetime.now().date()
        for query in query_history:
            query_date = query.get('date', datetime.now().date())
            if query_date == today:
                date_label = 'Today'
            elif query_date == today - timedelta(days=1):
                date_label = 'Yesterday'
            else:
                date_label = query_date.strftime('%d-%m-%Y')  # Format other dates as desired
            grouped_queries.setdefault(date_label, []).append(query)

        # Sort grouped queries by date (descending)
        sorted_grouped_queries = {date_label: grouped_queries[date_label] for date_label in sorted(grouped_queries, reverse=True)}

        # Pass only a portion of the question and answer to the template
        for queries in sorted_grouped_queries.values():
            for query in queries:
                query['question_short'] = query['question'][:21]  # Extract first 100 characters of question
                query['answer_short'] = query['response'][0][:10]  # Extract first 200 characters of answer
  
        return render_template('dashboard.html', username=username, grouped_queries=sorted_grouped_queries)
    return render_template('front.html')

@app.route('/provide_feedback', methods=['POST'])
def provide_feedback():
    if is_logged_in():
        if "username" in session:  # Regular login user
            username = session['username']
        elif "google_user_info" in session:  # Google login user
            username = session['google_user_info']['email']
        else:
            return jsonify({'error': 'User not logged in'})

        situation = request.form.get('situation')
        feedback_type = request.form.get('feedback_type')

        user_collection = db['users']

        update_field = f'queries.$.{feedback_type}'
        user_collection.update_one(
            {'username': username, 'queries.question': situation},
            {'$set': {update_field: True}}
        )

        return jsonify({'message': f'You {feedback_type}d the recommendation.'})
    else:
        return jsonify({'error': 'User not logged in'})


@app.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    if is_logged_in():
        if "username" in session:  # Regular login user
            username = session['username']
        elif "google_user_info" in session:  # Google login user
            username = session['google_user_info']['email']
        else:
            return jsonify({'error': 'User not logged in'})

        situation = request.form.get('situation')
        feedback = request.form.get('feedback')

        user_collection = db['users']

        user_collection.update_one(
            {'username': username, 'queries.question': situation},
            {'$set': {'queries.$.feedback': feedback}}
        )

        return jsonify({'message': 'Feedback submitted successfully.'})
    else:
        return jsonify({'error': 'User not logged in'})


@app.route('/logout')
def logout():
    session.clear()
    flash('You are now logged out', 'success')
    return redirect(url_for('login'))



@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        phoneno = request.form['phoneno']
        password = request.form['password']

        # Server-side validation for phone number format
        if not re.match(r'^\+91[1-9][0-9]{9}$', phoneno):
            flash('Please enter a valid Indian phone number in "+91XXXXXXXXXX" format', 'danger')
            return redirect(request.url)

        existing_user = db.users.find_one({'username': username})
        if existing_user is None:
            hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

            registration_time_utc = datetime.now(pytz.utc)
            ist = pytz.timezone('Asia/Kolkata')  # Indian Standard Time
            registration_time_ist = registration_time_utc.astimezone(ist)
        
        
            db.users.insert_one({'username': username, 'password': hashed_password,'phoneno':phoneno, 'registration_time': registration_time_ist})
            flash('Registration successful, please log in', 'success')
            return redirect(url_for('login'))
        else:
            flash('Username already exists', 'danger')
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = db.users.find_one({'username': username})
        if user and check_password_hash(user['password'], password):
            session['username'] = username
            
            login_time_utc = datetime.now(pytz.utc)
            ist = pytz.timezone('Asia/Kolkata')  # Indian Standard Time
            login_time_ist = login_time_utc.astimezone(ist)
        
            db.users.update_one({'username': username}, {'$set': {'last_login_time': login_time_ist}})

            flash('You are now logged in', 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid login', 'danger')
    return render_template('login.html')



@app.route('/delete-question', methods=['POST'])
def delete_question():
    if is_logged_in():
        if "username" in session:  # Regular login user
            username = session['username']
        elif "google_user_info" in session:  # Google login user
            username = session['google_user_info']['email']
        else:
            return jsonify({'error': 'User not logged in'})

        question = request.form.get('question')

        # Delete the question from the user's query history
        user_collection = db['users']
        user_collection.update_one(
            {'username': username},
            {'$pull': {'queries': {'question': question}}}
        )

        return jsonify({'message': 'Question deleted successfully'})
    else:
        return jsonify({'error': 'User not logged in'})
    

@app.route('/handle_yes', methods=['POST'])
def handle_yes():
    data = request.json
    answer = data.get('answer')
    question = data.get('question')
    text_matcher = TextMatcher()
    text_matcher.question = question
    text_matcher.answer = answer
    top_matches = text_matcher.match_texts()

    if top_matches and top_matches[0][0] != "No similar judgment found":
        # Prepare a list of dictionaries containing document content and scores
        matching_documents = []
        # Collect content for top 8 matching documents
        for i, (doc_id, score) in enumerate(top_matches, 1):
            document_content = text_matcher.get_document_content(doc_id)
            summary = text_matcher.get_summery(doc_id)
            document_content.update({"summary": summary})
            matching_documents.append(document_content)

        matching_doc_json = json.dumps(matching_documents)
        # Return matching documents
        return jsonify(matching_doc_json)
    else:
        # Handle case when no similar judgments are found
        return jsonify({"message": "No similar judgments found."})







if __name__ == '__main__':
    app.run(debug=True , port=8005)


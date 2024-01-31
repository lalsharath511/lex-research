
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from openai import OpenAI


app = Flask(__name__)
client_open_ai = OpenAI(api_key='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')
app.secret_key = "your_secret_key"  # Change this to a secure secret key
client = MongoClient("mongodb://localhost:27017/")
db = client["les_research"]

# Function to check if user is logged in
def is_logged_in():
    return "username" in session

# Routes

def llm_response(prompt):
    system_prompt = """
        You are an assistant specialized in income tax. 
        You will be given the following incident description; identify and provide your professional opinion in the following format:

        **Professional Opinion on Income Tax**

        1. **Introduction:**
           Provide an introduction outlining the purpose of the opinion and a brief summary of the issues to be addressed.

        2. **Factual Background:**
           Describe the relevant facts and circumstances surrounding the issue at hand. This is crucial for understanding the context in which the opinion is being sought.

        3. **Legal Analysis:**
           Perform a detailed analysis of the relevant provisions of the Income Tax Act, 1961, along with any applicable case law or judicial precedents. Tailor the analysis to the specific situation to provide a clear understanding of how the law applies.

        4. **Conclusion:**
           Conclude with a clear and concise summary of the legal position and the recommended course of action based on the analysis. This should be the key takeaway from the opinion.

        5. **Recommendations:**
           If applicable, provide recommendations for action or further steps that should be taken based on the analysis and conclusion.

        6. **Limitations:**
           Note any limitations or assumptions made in providing the opinion, along with a disclaimer outlining the scope and limitations of the opinion.

        Generate the professional opinion accordingly.
        
        if the insident is not related to the income tax responce should be "we dont provide Opinion which is not related to incometax"
    """
    response = client_open_ai.chat.completions.create(
        model='gpt-3.5-turbo',
        messages=[
            {"role":"system", "content":system_prompt},
            {"role":"user", "content":prompt}],
        temperature=0
    )
    return response.choices[0].message.content

@app.route('/get_recommendation', methods=['POST'])
def get_recommendation():
    if is_logged_in():
        situation = request.form.get('situation')
        username = session['username']

        # Get user data collection
        user_collection = db['users']

        # Here, you can process the situation and fetch a recommendation
        # Replace the following line with your logic to generate a recommendation
        
        recommendation = llm_response(situation)

        # Check if the question already exists in the user's queries
        existing_query = user_collection.find_one(
            {'username': username, 'queries.question': situation},
            projection={'_id': False, 'queries.$': True}
        )
        

        if existing_query:
            # If the question exists, append the new response to the existing query
            user_collection.update_one(
                {'username': username, 'queries.question': situation},
                {
                    '$push': {'queries.$.response': recommendation},
                    '$setOnInsert': {'queries.$.like': False, 'queries.$.dislike': False, 'queries.$.feedback': ''}
                }
            )
        else:
            # If the question does not exist, add a new query to the user's queries
            user_collection.update_one(
                {'username': username},
                {
                    '$push': {
                        'queries': {
                            'question': situation,
                            'response': [recommendation],
                            'like': False,
                            'dislike': False,
                            'feedback': ''
                        }
                    }
                }
            )


        return jsonify({'recommendation': recommendation})
    else:
        flash('You are not logged in', 'danger')
        return redirect(url_for('login'))

@app.route('/')
def index():
    if is_logged_in():
        return render_template('dashboard.html', username=session['username'])
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = db.users.find_one({'username': username})
        if user and check_password_hash(user['password'], password):
            session['username'] = username
            flash('You are now logged in', 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid login', 'danger')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        phoneno = request.form['phoneno']
        password = request.form['password']
        existing_user = db.users.find_one({'username': username})
        if existing_user is None:
            hashed_password = generate_password_hash(password, method='sha256')
            db.users.insert_one({'username': username, 'password': hashed_password,'phoneno':phoneno})
            flash('Registration successful, please log in', 'success')
            return redirect(url_for('login'))
        else:
            flash('Username already exists', 'danger')
    return render_template('register.html')


@app.route('/provide_feedback', methods=['POST'])
def provide_feedback():
    if is_logged_in():
        situation = request.form.get('situation')
        feedback_type = request.form.get('feedback_type')
        

        username = session['username']
        user_collection = db['users']
        
        # Update the feedback field based on the feedback type
        update_field = f'queries.$.{feedback_type}'
        # Update the corresponding feedback field in the MongoDB collection
        user_collection.update_one(
            {'username': username, 'queries.question': situation},
            {'$set': {update_field: True}}
        )

        return jsonify({'message': f'You {feedback_type}d the recommendation.'})

    return jsonify({'error': 'User not logged in'})


@app.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    if is_logged_in():  # Assuming you have a function to check if the user is logged in
        username = session['username']  # Assuming you have a session containing the username
        situation = request.form.get('situation')
        print(situation)# Assuming you are passing the situation along with feedback

        feedback = request.form.get('feedback')
        print(feedback)
        
        user_collection = db['users']

        # Update the feedback field in the MongoDB collection
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

if __name__ == '__main__':
    app.run(debug=True)

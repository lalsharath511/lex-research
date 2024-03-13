import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
class TextMatcher:
    def __init__(self):
        self.client = MongoClient("mongodb+srv://lalsharath511:Sharathbhagavan15192142@legal.mosm3f4.mongodb.net/")
        self.db = self.client["lex_learn"]
        self.collection = self.db["judgements"]
        self.question = ""
        self.answer = ""

    def preprocess_text(self, text):
        # Remove punctuation and special characters
        text = re.sub(r'[^\w\s]', '', text)
        # Convert to lowercase
        text = text.lower()
        return text

    def calculate_cosine_similarity(self, question_answer, content):
        # Preprocess text
        question_answer = self.preprocess_text(question_answer)
        content = self.preprocess_text(content)
        # Compute TF-IDF vectors
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([question_answer, content])
        # Calculate cosine similarity
        cosine_sim = cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])[0][0]
        return cosine_sim

    def match_texts(self):
        # Initialize list to store similarity scores
        similarity_scores = []

        # Preprocess question and answer
        preprocessed_query = self.preprocess_text(self.question + " " + self.answer)

        # Iterate over documents in the collection
        for document in self.collection.find():
            content = document.get("content", "")
            if content:
                # Calculate cosine similarity
                similarity_score = self.calculate_cosine_similarity(preprocessed_query, content)
                # Check if similarity score is above a certain threshold
                if similarity_score >= 0.5:  # Adjust threshold as needed
                    # Store document ID and similarity score
                    similarity_scores.append((document["meta_data_id"], similarity_score))

        # Sort similarity scores in descending order
        similarity_scores.sort(key=lambda x: x[1], reverse=True)
        
        if not similarity_scores:
            return [("No similar judgment found", 0)]  # Return a message indicating no similar judgment found
        
        return similarity_scores[:8]
    def get_document_content(self, doc_id):
        document = self.db["meta_data"].find_one({"_id": doc_id})
        if document:
            del document["_id"]  # Remove the _id field
            return document
        else:
            return None

    def get_summery(self,meta_id):
        document = self.db["judgements"].find_one({"meta_data_id": meta_id})
        # print(document)
        if document:
            # del document["_id"]  # Remove the _id field
            summery=document['summery']
            return summery
        else:
            return None
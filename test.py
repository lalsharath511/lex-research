import pymongo

# Connect to MongoDB
client = pymongo.MongoClient("mongodb+srv://lalsharath511:Sharathbhagavan15192142@legal.mosm3f4.mongodb.net/")
database = client["lex_learn"]  # Replace "your_database_name" with your actual database name
collection = database["judgements"]  # Replace "your_collection_name" with your actual collection name

# Fetch all data in the collection
all_documents = collection.find()

# Iterate over the documents
for document in all_documents:
    print(document)

# Close MongoDB connection
client.close()
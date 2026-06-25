import chromadb

from sentence_transformers import SentenceTransformer

# Load embedding model
model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

# Connect to SAME shared ChromaDB
client = chromadb.PersistentClient(
    path=r"C:\Users\RishabhJain\Desktop\llm_requirement_parser\Llm_Requirement-Parser\backend\chroma_db"
)

# Open existing collection
collection = client.get_or_create_collection(
    name="jira_tickets"
)


def retrieve_similar_tickets(requirement):

    """
    Retrieve semantically similar
    historical Jira tickets
    """

    # Convert requirement into embedding
    query_embedding = model.encode(
        requirement
    ).tolist()

    # Search similar vectors
    results = collection.query(

        query_embeddings=[query_embedding],

        n_results=5
    )

    retrieved_tickets = []
    print("Retrieved tickets:", results)
    # Similarity threshold
    # Smaller distance = more similar
    THRESHOLD = 2.0

    # Chroma returns:
    # metadatas
    # distances
    # documents

    if results["metadatas"]:

        metadatas = results["metadatas"][0]

        distances = results["distances"][0]

        documents = results["documents"][0]

        for metadata, distance, document in zip(
            metadatas,
            distances,
            documents
        ):

            # Ignore weak matches
            if distance > THRESHOLD:
                continue

            retrieved_tickets.append({

                "ticket_key":
                    metadata.get(
                        "ticket_key"
                    ),

                "title":
                    metadata.get(
                        "title"
                    ),

                "module":
                    metadata.get(
                        "module"
                    ),

                "priority":
                    metadata.get(
                        "priority"
                    ),

                "status":
                    metadata.get(
                        "status"
                    ),

                "distance":
                    round(distance, 3),

                "document":
                    document
            })
    print("Retrieved tickets:", retrieved_tickets)
    return retrieved_tickets
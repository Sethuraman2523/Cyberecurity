import base64

choice = input("Encrypt(E) / Decrypt(D): ").upper()

if choice == "E":
    text = input("Enter text: ")
    encrypted = base64.b64encode(text.encode()).decode()
    print("Protected:", encrypted)

elif choice == "D":
    text = input("Enter protected text: ")
    try:
        decrypted = base64.b64decode(text.encode()).decode()
        print("Restored:", decrypted)
    except:
        print("Invalid protected data")

else:
    print("Invalid choice")
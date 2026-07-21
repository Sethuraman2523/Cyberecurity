email = input("Enter email content: ").lower()

keywords = [
    "urgent",
    "click here",
    "verify",
    "password",
    "bank",
    "otp",
    "account",
    "login",
    "http://",
    "https://"
]

flag = False

for word in keywords:
    if word in email:
        flag = True
        break

if flag:
    print("Unsafe Email")
else:
    print("Safe Email")
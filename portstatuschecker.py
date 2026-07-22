import socket

port = int(input())

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(1)

result = s.connect_ex(("localhost", port))

if result == 0:
    print("Open")
else:
    print("Closed")

s.close()
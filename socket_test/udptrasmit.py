import socket

UDP_IP = "192.168.0.50"
UDP_PORT = 12345

MESSAGE = bytes.fromhex("BD 02 00 09 60 0E 15 B8 01 8D 4B F1 A5 A4 5E B2 FF E2 AB CD CF 12 00 09 60 7B 15 B8 0C 01 4B F1 A5 71 5E B3 00 7A AB CD EF 12")

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.sendto(MESSAGE, (UDP_IP, UDP_PORT))
print(f"Sent data to {UDP_IP}:{UDP_PORT}")
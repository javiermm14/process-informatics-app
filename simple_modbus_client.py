from pymodbus.client import ModbusTcpClient

client = ModbusTcpClient("192.168.5.1", port=502)

if client.connect():
    print("PLCに接続しました")

    # ← すべてキーワード引数で渡すのが正しい
    rr = client.read_holding_registers(address=0, count=2, slave=1)
    if rr.isError():
        print("読み取りエラー:", rr)
    else:
        print(f"D5500の値: {rr.registers[0]}")
        print(f"D5501の値: {rr.registers[1]}")

    result = client.write_register(address=0, value=1234, slave=1)
    if result.isError():
        print("書き込みエラー:", result)
    else:
        print("D100に1234を書き込みました")

    client.close()
else:
    print("PLCに接続できませんでした")
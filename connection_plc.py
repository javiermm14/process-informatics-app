from pymodbus.client import ModbusTcpClient

client = ModbusTcpClient("192.168.5.1", port=502)

if client.connect():
    print("PLCに接続しました")

    # 199番から4つのレジスタに1を書き込む
    write_result = client.write_registers(address=70, values=[1, 1, 1, 1], slave=1)
    if write_result.isError():
        print("書き込みエラー:", write_result)
    else:
        print("書き込み成功（70番から4つのレジスタに1を書き込み）")

    # モータ、センサ状態読み取り
    rr = client.read_holding_registers(address=0, count=30, slave=1)
    if rr.isError():
        print("読み取りエラー:", rr)
    else:
        # ゲート開閉状態(開:2, 閉: 1, 不定: 0)
        d5500 = rr.registers[0]
        d5501 = rr.registers[1]
        d5502 = rr.registers[2]

        print("投入1G:", d5500)
        print("投入2G:", d5501)
        print("排出G:", d5502)

        # モータ状態(ON:1, OFF: 0)
        d5510 = rr.registers[10]
        print("モータ状態:", d5510)

        # モータ速度
        d5012 = rr.registers[12]
        print("モータ速度:", d5012)

        # 温度データ
        d5520 = rr.registers[20]
        d5522 = rr.registers[22]
        d5524 = rr.registers[24]

        print("投入1温度:", d5520)
        print("投入2温度:", d5522)
        print("排出温度:", d5524)

    # PLC本体時刻読み取り
    rr = client.read_holding_registers(address=90, count=7, slave=1)
    if rr.isError():
        print("読み取りエラー:", rr)
    else:
        d5590 = rr.registers[0] # 年
        d5591 = rr.registers[1] # 月
        d5592 = rr.registers[2] # 日
        d5593 = rr.registers[3] # 時
        d5594 = rr.registers[4] # 分
        d5595 = rr.registers[5] # 秒
        d5596 = rr.registers[6] # 

        print("PLC本体時刻:", d5590, "/", d5591, "/", d5592, " ", d5593, ":", d5594, ":", d5595, ":", d5596)

    # 完成品IDデータ読み取り
    rr = client.read_holding_registers(address=100, count=10, slave=1)
    if rr.isError():
        print("読み取りエラー:", rr)
    else:
        
        # バイトスワップしたレジスタ値リスト
        swapped_regs = [((r & 0x00FF) << 8) | ((r & 0xFF00) >> 8) for r in rr.registers]

        # バイトデータに変換
        byte_data = b''.join(reg.to_bytes(2, byteorder='big') for reg in swapped_regs)

        # null終端やスペース除去してASCIIデコード
        Product_code = byte_data.decode('ascii').rstrip('\x00').rstrip()
        print("完成品ID:", Product_code)

    client.close()
else:
    print("PLCに接続できませんでした")

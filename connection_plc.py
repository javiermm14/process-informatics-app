from pymodbus.client import ModbusTcpClient

def operate_plc(write_values=[1, 1, 1, 1]):
    print("書き込み値:", write_values)
    client = ModbusTcpClient("192.168.5.1", port=502)
    result = {"connected": False, "write": None, "read": {}, "error": None}
    if client.connect():
        result["connected"] = True
        # 199番から4つのレジスタに書き込み
        write_result = client.write_registers(address=70, values=write_values, slave=1)
        if write_result.isError():
            result["write"] = f"書き込みエラー: {write_result}"
        else:
            result["write"] = "書き込み成功（70番から4つのレジスタに書き込み）"
        # モータ、センサ状態読み取り
        rr = client.read_holding_registers(address=0, count=30, slave=1)
        if not rr.isError():
            result["read"]["gate"] = rr.registers[0:3]
            result["read"]["motor_state"] = rr.registers[10]
            result["read"]["motor_speed"] = rr.registers[12]
            result["read"]["temp1"] = rr.registers[20]
            result["read"]["temp2"] = rr.registers[22]
            result["read"]["temp3"] = rr.registers[24]
        # PLC本体時刻読み取り
        rr = client.read_holding_registers(address=90, count=7, slave=1)
        if not rr.isError():
            result["read"]["datetime"] = rr.registers[0:7]
        # 完成品IDデータ読み取り
        rr = client.read_holding_registers(address=100, count=10, slave=1)
        if not rr.isError():
            swapped_regs = [((r & 0x00FF) << 8) | ((r & 0xFF00) >> 8) for r in rr.registers]
            byte_data = b''.join(reg.to_bytes(2, byteorder='big') for reg in swapped_regs)
            Product_code = byte_data.decode('ascii').rstrip('\x00').rstrip()
            result["read"]["product_code"] = Product_code
        client.close()
    else:
        result["error"] = "PLCに接続できませんでした"
    return result

# テスト用（直接実行時のみ）
if __name__ == "__main__":
    res = operate_plc()
    print(res)

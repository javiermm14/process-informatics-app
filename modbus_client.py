import csv
import os
from pymodbus.client import ModbusTcpClient

def read_csv_parameters(csv_file_path):
    """CSVファイルから製造パラメータを読み取る"""
    parameters = {}
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                parameters = row
                break
        return parameters
    except FileNotFoundError:
        print(f"CSVファイルが見つかりません: {csv_file_path}")
        return None
    except Exception as e:
        print(f"CSVファイル読み取りエラー: {e}")
        return None

def write_parameters_to_plc(parameters):
    """製造パラメータをPLCに送信"""
    client = ModbusTcpClient("192.168.5.1", port=502)
    
    if client.connect():
        print("PLCに接続しました")
        
        try:
            # CSVから読み取った値をPLCの対応するレジスタに書き込み
            liquid_a = int(parameters.get('液体A', 0))
            liquid_b = int(parameters.get('液体B', 0))
            temperature = int(parameters.get('温度', 0))
            stirring_speed = int(parameters.get('撹拌速度', 0))
            target_hardness = int(parameters.get('目標硬度', 0))
            target_weight = int(parameters.get('目標重量', 0))
            
            # 各パラメータを順番にPLCに書き込み
            registers = [
                (0, liquid_a, "液体A"),
                (1, liquid_b, "液体B"),
                (2, temperature, "温度"),
                (3, stirring_speed, "撹拌速度"),
                (4, target_hardness, "目標硬度"),
                (5, target_weight, "目標重量")
            ]
            
            for address, value, name in registers:
                result = client.write_register(address=address, value=value, slave=1)
                if result.isError():
                    print(f"{name}の書き込みエラー:", result)
                else:
                    print(f"{name}: {value} をD{100+address}に書き込みました")
            
            print("すべてのパラメータをPLCに送信完了")
            
        except ValueError as e:
            print(f"パラメータ変換エラー: {e}")
        except Exception as e:
            print(f"予期しないエラー: {e}")
        
        client.close()
    else:
        print("PLCに接続できませんでした")

def main():
    csv_file_path = "parameter.csv"
    
    # CSVファイルが存在するかチェック
    if not os.path.exists(csv_file_path):
        print(f"CSVファイル '{csv_file_path}' が見つかりません。")
        print("React アプリから製造条件をダウンロードしてから実行してください。")
        return
    
    # CSVファイルから製造パラメータを読み取り
    parameters = read_csv_parameters(csv_file_path)
    
    if parameters:
        print("読み取った製造パラメータ:")
        for key, value in parameters.items():
            print(f"  {key}: {value}")
        
        # パラメータをPLCに送信
        write_parameters_to_plc(parameters)
    else:
        print("製造パラメータの読み取りに失敗しました")

if __name__ == "__main__":
    main()
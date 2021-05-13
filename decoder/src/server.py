import sys
from flask import Flask, request, jsonify
from decoder import Decoder
import os

decoder = Decoder()

server = Flask(__name__)


@server.route("/close", methods=["GET"])
def close():
    os._exit(1)


@server.route('/api/decode-result', methods=['GET'])
def decode():
    if request.args.get('protocol') == 'ax25':
        try:
            return decoder.direwolf(request.args.get('path'),
                                    request.args.get('baudrate'))
        except FileNotFoundError as e:
            return jsonify({'message': e.args[0]}), 400
        except Exception as e:
            return jsonify({'message': e.args[0]}), 500

    else:
        return jsonify({'message': "Invalid URL parameter: 'protocol'"}), 400


if __name__ == '__main__':
    server.run(host='127.0.0.1', port=int(sys.argv[1]))

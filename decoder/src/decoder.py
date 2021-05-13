import os
import platform
import subprocess


class Decoder:
    def direwolf(self, path, baudrate):
        if (os.path.exists(path) is False):
            raise FileNotFoundError('File not found')

        pf = platform.system()

        if pf == 'Windows':
            decoder_path = 'atest'
        elif pf == 'Linux' or pf == 'Darwin':
            decoder_path = './atest'
        else:
            raise OSError('OS not supported')

        try:
            process = subprocess.run([decoder_path, '-B', baudrate, '-h', path],
                                     stdout=subprocess.PIPE,
                                     stderr=subprocess.STDOUT,
                                     check=True,
                                     errors="ignore")
        except Exception:
            return ''

        packets = process.stdout.split('DECODED')

        if len(packets) <= 1:  # No packet
            return ''

        decode_data = ''

        for packet in packets[1:]:
            decode_result = packet.split('------')

            if len(decode_result) > 1:
                lines = [e for e in decode_result[1].split('\n') if e != '']

                for line in lines[3:]:
                    decode_data += line.split('  ')[2].replace(' ', '')

                decode_data += '\n'

        return decode_data

import mne
from flask import Flask, request, render_template, redirect, session, jsonify
# from flask_socketio import SocketIO, emit, send, join_room, leave_room
#read raw datam

app = Flask(__name__)
# socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('mne.html')

@app.route('/getdata/<string:filename>')
def getdata(filename):

    raw = mne.io.read_raw_eeglab('./data/' + filename + '')
    data  = raw.to_data_frame().to_json()

    return jsonify({'data':data})
#
# #get file info
# info = raw.info
#
# #get data
# data = raw.load_data()
#
#
# print(dir(raw.to_data_frame().to_json()))


# print(dir(data))
# print(data.get_data())


if __name__ == '__main__':
    # socketio.run(app, host = '0.0.0.0', port = '5000')
    app.run(port = '5000')

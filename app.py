from pymongo import MongoClient
import jwt
import datetime
import hashlib
from flask import Flask, render_template, jsonify, request, redirect, url_for
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['UPLOAD_FOLDER'] = "./static/profile_pics"

SECRET_KEY = 'JINI'

# client = MongoClient('15.164.227.141', 27017, username="test", password="test")
client = MongoClient('localhost', 27017)
db = client.sora_prac01


@app.route('/')
def home():
    token_receive = request.cookies.get('mytoken')

    if token_receive is not None:
        try:
            # payload로부터 id를 꺼내와서 실제 유저의 정보를 읽어줄것임
            payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
            user_info = db.sign_users.find_one({'username': payload['id']})
            myname = db.sign_users.find_one({'username': payload['id']})['username']

            return render_template('dog_friends.html', user_info=user_info, name=myname)

        except jwt.ExpiredSignatureError:
            return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
        except jwt.exceptions.DecodeError:
            return redirect(url_for("login"))

    else:
        return render_template('dog_friends.html')


@app.route('/detail/<file>')
def detail(file):
    token_receive = request.cookies.get('mytoken')

    if token_receive is not None:

        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])

        myname = db.sign_users.find_one({'username': payload['id']})['username']

        comments = list(db.posting.find({'file': file}, {'_id': False}).sort('upload', 1))
        print(comments)

        return render_template('detail.html', name=myname, pic_file=file, comment_list=comments)

    else:
        return redirect(url_for("login"))

@app.route('/login')
def login():
    msg = request.args.get("msg")
    return render_template('login.html', msg=msg)


@app.route('/sign_in', methods=['POST'])
def sign_in():
    username_receive = request.form['username_give']
    password_receive = request.form['password_give']

    pw_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    result = db.sign_users.find_one({'username': username_receive, 'password': pw_hash})

    # result가 있어서 성공하면

    if result is not None:

        payload = {
            'id': username_receive,
            # 지금부터 timedelta로 60초*60초*24
            'exp': datetime.utcnow() + timedelta(seconds=60 * 60 * 24)  # 로그인 24시간 유지
        }
        # payload에 token을 만들어서 secret key로 암호화를 해준다음에,
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256').decode('utf-8')

        # client에게 던져줌
        return jsonify({'result': 'success', 'token': token})

    else:
        return jsonify({'result': 'fail', 'msg': '아이디/비밀번호가 일치하지 않습니다.'})

@app.route('/sign_up/save', methods=['POST'])
def sign_up():
    name1_receive = request.form['name1_give']
    name2_receive = request.form['name2_give']
    username_receive = request.form['username_give']
    password_receive = request.form['password_give']

    password_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest();

    doc = {
        "name1": name1_receive,
        "name2": name2_receive,
        "username": username_receive,
        "password": password_hash,
        "profile_pic": "",
        "profile_info": ""
    }

    db.sign_users.insert_one(doc)
    return jsonify({'result': 'success'})


@app.route('/sign_up/checkup', methods=['POST'])
def check_up():
    username_receive = request.form['username_give']
    # username 으로 찾아서 있으면 가져오고 찾아서 없으면 bool이면 false가 됨(가져오지 않음)
    exists = bool(db.sign_users.find_one({"username": username_receive}))
    return jsonify({'result': 'success', 'exists': exists})

@app.route('/dog_regist', methods=['POST'])
def dog_regist():
    token_receive = request.cookies.get('mytoken')

    try:
        # payload로부터 id를 꺼내와서 실제 유저의 정보를 읽어줄것임
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.sign_users.find_one({'username': payload['id']})
        name_receive = request.form['dogname_give']
        age_receive = request.form['dogage_give']
        dogkind_receive = request.form['dogkind_give']
        doggender_receive = request.form['doggender_give']
        doglocate_receive = request.form['doglocate_give']
        filedate_receive = request.form['filedate_give']
        file = request.files["file_give"]

        extension = file.filename.split('.')[-1]

        today = datetime.now()
        mytime = today.strftime('%Y-%m-%d-%H-%M-%S')

        filename = f'file-{mytime}'

        save_to = f'static/{filename}.{extension}'
        # File을 save하는데 괄호안에는 경로와 이름이 들어감
        file.save(save_to)

        doc = {
            'username': user_info['username'],
            'dog_name': name_receive,
            'dog_age': age_receive,
            'dog_kind': dogkind_receive,
            'dog_gender': doggender_receive,
            'dog_locate': doglocate_receive,
            'file': f'{filename}.{extension}',
            'date': today.strftime('%Y-%m-%d'),
            'upload': filedate_receive
        }

        db.dog_info.insert_one(doc)
        return jsonify({'result': 'success', 'msg': '강아지 친구 추가요~'})
    except(jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("/"))

@app.route('/locate', methods=['GET'])
def locate():
    doglocate_receive = request.args.get('doglocate_give')
    print(str(doglocate_receive))

    if doglocate_receive == 'all':
        dog_list = list(db.dog_info.find({}, {'_id': False}).sort('file', -1))
    else:
        dog_list = list(db.dog_info.find({'dog_locate': {'$eq': doglocate_receive}}, {'_id': False}).sort('file', -1))
    print(dog_list)

    return jsonify({'result': 'success', 'dogs_list': dog_list})


@app.route('/detail', methods=['GET'])
def get_detail():
    file_receive = request.args.get('file_give')

    dog_list = list(db.dog_info.find({'file': file_receive}, {'_id': False}))

    return jsonify({'result': 'success', 'dogs': dog_list})


@app.route('/posting', methods=['POST'])
def posting():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.sign_users.find_one({'username': payload['id']})
        comment_receive = request.form['comment_give']
        date_receive = request.form['date_give']
        file = request.form["file_give"]
        upload_time = request.form['upload_give']

        # print(file)
        doc = {
            'username': user_info['username'],
            'comment': comment_receive,
            'date': date_receive,
            'file': file,
            'upload': upload_time
        }

        db.posting.insert_one(doc)
        return jsonify({'result': 'success', 'msg': 'success posting'})

    except(jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("detail"))


# @app.route('/update_like', methods=['POST'])
# def like():
#     token_receive = request.cookies.get('mytoken')
#
#     try :
#         payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
#         user_info = db.users.find_one({"username": payload["id"]})
#         post_id_receive = request.form["post_id_give"]
#         type_receive = request.form["type_give"]
#         action_receive = request.form["action_give"]
#
#         doc = {
#             'post_id':post_id_receive,
#             'username':user_info['username'],
#             'type':type_receive
#         }
#         if action_receive == 'like':
#             db.likes.insert_one(doc)
#         else :
#             db.likes.delete_one(doc)
#
#         count = db.likes.count_documents({'post_id':post_id_receive,'type':type_receive})
#         print(count)
#
#         return jsonify({'result':'success','msg':'updated','count':count})
#     except (jwt.ExpiredSignatureError,jwt.exceptions.DecodeError):
#         return redirect(url_for("home"))
#

@app.route('/update_like',methods=['POST'])
def like():
    name_receive = request.form['name_give']

    print(name_receive)

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
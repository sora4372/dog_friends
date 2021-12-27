 function btn_login() {
            let username = $("#login_id").val();
            let password = $("#login_pwd").val();

            if (username == "") {
                $("#help-id").text("IDを入力してください");
                $("#login_id").addClass("is-danger");
                return;
            } else {
                $("#login_id").removeClass("is-danger");
                $("#help-id").text("");
                $(".id_icon").css('color', 'black')
            }

            if (password == "") {
                $("#help-password").text("パスワードを入力してください");
                $("#login_pwd").addClass("is-danger");
                return;
            } else {
                $("#login_pwd").removeClass("is-danger");
                $("#help-password").text("");
            }

            $.ajax({
                type: "POST",
                url: "/sign_in",
                data: {
                    username_give: username,
                    password_give: password
                },
                success: function (response) {
                    if (response['result'] == 'success') {
                        $.cookie('mytoken', response['token'], {path: '/'});
                        window.location.replace('/')
                    } else {
                        alert(response['msg'])
                    }

                }
            })
        }

        function sign_btn_toggle() {

            $(".sign_up_box").toggleClass("is-hidden");
            $(".box").toggleClass('is-hidden');
            $(".login_button").toggleClass("is-hidden");
        }

        function btn_sign_up() {
            let name1 = $("#sign_up_name1").val()
            let name2 = $("#sign_up_name2").val()
            let username = $("#sign_up_id").val()
            let password = $("#sign_up_pwd").val()
            let password2 = $("#sign_up_pwd_2").val()

            if ($("#sign_up_id").hasClass("is-danger")) {
                alert("IDをもう一度ご確認ください")
                return;
            }

            if (name1 == "" || name2 == "") {
                $("#sign-help-name").text("お名前を入力してください")
                $(".input_name").addClass("is-danger")
                return;
            } else {
                $("#sign-help-name").text("")
                $(".input_name").removeClass("is-danger")
            }

            if (username == "") {
                $("#sign-help-id").text("IDを入力してください");
                $("#sign_up_id").addClass("is-danger");
                return;

            } else if (!is_nickname(username)) {
                $("#sign-help-id").text("IDの形式が正しくありません");
                $("#sign_up_id").addClass("is-danger").focus();
                return;

            } else {
                $("#sign-help-id").text("");
                $("#sign_up_id").removeClass("is-danger");
            }

            if (password == "") {
                $("#sign-help-pwd").text("パスワードを入力してください");
                $("#sign_up_pwd").addClass("is-danger");
                return;

            } else if (!is_password(password)) {
                $("#sign-help-pwd").text("パスワードの形式が正しくありません");
                $("#sign_up_pwd").addClass("is-danger").focus();
                return;

            } else {
                $("#sign-help-pwd").text("");
                $("#sign_up_pwd").removeClass("is-danger");
            }

            if (password2 == "") {
                $("#sign-help-pwd-2").text("確認パスワードを入力してください");
                $("#sign_up_pwd_2").addClass("is-danger")
                return;

            } else if (password != password2) {
                $("#sign-help-pwd-2").text("パスワードが一致してません");
                $("#sign_up_pwd_2").addClass("is-danger").focus();
                return;

            } else if (password == password2) {
                $("#sign-help-pwd-2").text("");
                $("#sign_up_pwd_2").removeClass("is-danger");
            }

            $.ajax({
                type: 'POST',
                url: '/sign_up/save',
                data: {
                    name1_give: name1,
                    name2_give: name2,
                    username_give: username,
                    password_give: password
                },
                success: function (response) {
                    alert("入会が完了しました〜")
                    window.location.replace('/login')

                }
            })
        }

        //아이디의 regex
        function is_nickname(value) {
            var regExp = /^(?=.*[a-z])[-a-z0-9+.]{2,10}$/;
            return regExp.test(value);
        }

        //비밀번호의 regex
        function is_password(value) {
            var regExp = /^(?=.*\d)(?=.*[a-z])[0-9a-z!@]{8,20}$/;
            return regExp.test(value);
        }

        //textboxを押下するとfoucusin/out이 됨

        function sign_up_check() {
            let username = $("#sign_up_id").val()

            if (username == "") {
                $("#sign-help-id").text("IDを入力してください");
                $("#sign_up_id").addClass("is-danger");
                return;
            } else if (!is_nickname(username)) {
                $("#sign-help-id").text("IDの形式が正しくありません");
                $("#sign_up_id").addClass("is-danger").focus();
                return;
            } else {
                $("#sign-help-id").text("");
                $("#sign_up_id").removeClass("is-danger");
            }

            $.ajax({
                type: 'POST',
                url: '/sign_up/checkup',
                data: {
                    username_give: username
                },
                success: function (response) {
                    if (response["exists"]) {
                        $("#sign-help-id").text("すでに存在するIDです")
                        $("#sign_up_id").addClass("is-danger");
                        $("#input-username").focus();
                    } else {
                        $("#sign-help-id").text("登録できるIDです");
                    }
                }
            })
        }
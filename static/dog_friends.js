function dog_post() {
    let dog_name = $("#regist_name").val()
    let dog_age = $('select[name=regist_age]').val()
    let dog_kind = $('select[name=regist_kind]').val()
    let dog_gender = $(':radio[name=regist_gender]:checked').val()
    let dog_locate = $('select[name=regist_locate]').val()
    let file = $('#file')[0].files[0]

    console.log(dog_kind)

    let form_data = new FormData()

    form_data.append('dogname_give', dog_name)
    form_data.append('dogage_give', dog_age)
    form_data.append('dogkind_give', dog_kind)
    form_data.append('doggender_give', dog_gender)
    form_data.append('doglocate_give', dog_locate)
    form_data.append('filedate_give', today)
    form_data.append('file_give', file)


    $.ajax({
        type: 'POST',
        url: "/dog_regist",
        data: form_data,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            if (response['result'] == 'success') {
                alert(response['msg'])
                window.location.reload()
            } else {
                alert(response['msg'])
            }
        }
    })
}

function sign_out() {
    //token을 버릴거야~ 라고 할떄, (자유이용권을 버린다고 할때) .removeCookie라는 jquery함수를 사용함
    $.removeCookie('mytoken', {path: '/'});
    alert('ログアウト!')
    window.location.href = "/"
}

function dog_search() {
    let dog_search = $("select[name=dog_search]").val();
    $('#dog_list').empty()

    $.ajax({
        type: 'GET',
        url: '/locate',
        data: {doglocate_give: dog_search},
        success: function (response) {
            let all_dogs = response['dogs_list']
            console.log(all_dogs)
            for (let i = 0; i < all_dogs.length; i++) {
                console.log(all_dogs[i])
                let dog = all_dogs[i]
                let dog_name = dog['dog_name']
                let dog_kind = dog['dog_kind']
                let dog_locate = dog['dog_locate']
                let file = dog['file']
                let dog_date = new Date(dog["upload"])
                let time_before = time2str(dog_date)

                let dog_html = `<div class="dog_book">
                                            <div class="dog_photo"><a href = "/detail/${file}"><img src="../static/${file}" alt="blue_pants"></a>
                                            </div>
                                            <div class="toggle_heart" aria-label="heart" onclick="toggle_heart('heart')">
                                                <span class="icon is-small"><i class="fa fa-heart"></i></span>
                                                <span class="heart-num">1.2k</span>
                                            </div>
                                            <div id="dog_name" class ="front_dog">${dog_name}</div>
                                            <div id="dog_kind" class ="front_dog">${dog_kind}</div>
                                            <div id="dog_locate" class ="front_dog">${dog_locate}</div>
                                            <div id="dog_date">${time_before}</div>
                                        </div> `

                $('#dog_list').append(dog_html)
            }
        }
    })
}

function toggle_heart(dog, type) {
    console.log(dog, type)

    // let $a_like = $(`#${post_id} a[aria-label='${type}']`)
    let $a_like = $(`#${dog} div[aria-label="heart"]`)
    let $i_like = $a_like.find('i')
    if ($i_like.hasClass('fa-heart')) {
        $.ajax({
            type: 'POST',
            url: '/update_like',
            data: {
                post_id_give: dog,
                type_give: type,
                action_give: 'unlike'
            },
            success: function (response) {
                console.log('unlike')
                $i_like.addClass('fa-heart-o').removeClass('fa-heart')
                $a_like.find('span.like-num').text(response['count'])
            }
        })
    }
}

function time2str(date) {
    let today = new Date()
    let time = (today - date) / 1000 / 60  // 분

    if (time < 60) {
        return parseInt(time) + "分前"
    }
    time = time / 60  // 시간
    if (time < 24) {
        return parseInt(time) + "時間前"
    }
    time = time / 24
    if (time < 7) {
        return parseInt(time) + "日前"
    }
    return `${date.getFullYear()}年 ${date.getMonth() + 1}月 ${date.getDate()}日`
}

function num2str(count) {
    if (count > 10000) {
        return parseInt(count / 1000) + "k"
    }
    if (count > 500) {
        return parseInt(count / 100) / 10 + "k"
    }
    if (count == 0) {
        return ""
    }
    return count
}

function sign() {
    window.location.replace('/login')
}
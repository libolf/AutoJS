var SimpleUtils = require('./SimpleUtils')
var Consts = require('./consts')

var Utils = {}

var alreadyRun = []

var mainAccountView = null

Utils.changeLoginUser = function changeLogin(mainAccount, mainAccountNickName) {
    console.log("change login");

    text("我的").findOne().parent().click()
    sleep(500)

    var settings = text("设置").findOne()
    SimpleUtils.clickViewCenter(settings)
    sleep(500)

    var changeUser = text("换账号登录").findOne()
    SimpleUtils.clickViewCenter(changeUser)
    sleep(500)

    var list = className("ListView").findOne()
    var listChildCount = list.childCount() - 1
    if (listChildCount == 1) {
        return Consts.ONLY_MAIN_ACCOUNT
    }
    for (let index = 0; index < listChildCount; index++) {
        let userParent = list.child(index)
        var userName = findUser(userParent)
        console.log("index: " + index + " username: " + userName + " all: " + alreadyRun);

        if (userName.indexOf(mainAccount) >= 0) {
            console.log("get main account view");
            mainAccountView = userParent
        }

        if (index == 0) {
            alreadyRun.push(userName)
        } else {
            // 查找已经运行的账号中是否有当前账号，有则跳过，没有则进入此账号
            let userIndex = alreadyRun.indexOf(userName)
            if (userIndex == -1) {
                SimpleUtils.clickViewCenter(userParent)
                // 当为切换的最后一个账号是主账号则返回RUN_AGAIN
                if (userName.indexOf(mainAccount) >= 0) {
                    if (index == listChildCount-1) {
                        return Consts.MAIN_ACCOUNT_BUT_NEED_RUN_AGAIN
                    }else{
                        return Consts.MAIN_ACCOUNT_AND_CONTINUE
                    }
                }
                mainAccountView = null
                return Consts.NOT_MAIN_ACCOUNT
            }
        }
    }

    console.log(findUser(mainAccountView));

    // 当主账号不是首位时点击跳转到主账号
    if (mainAccountView) {
        SimpleUtils.clickViewCenter(mainAccountView)
    }

    return Consts.MAIN_ACCOUNT
}

/**
 * 在用户名的父控件中查找用户名
 * @param {用户名的父控件} userParent 
 */
function findUser(userParent) {
    var user = userParent.findOne(className("TextView"));
    return user.text()
}


module.exports = Utils;
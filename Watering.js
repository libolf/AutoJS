var SimpleUtils = require('./SimpleUtils')

var Watering = {}

var currentUserName = null
var webView = null
var currentToastText = null

Watering.wateringToMainAccount = function () {
    getCurrentUserName()
    console.log("user name: " + currentUserName);
    events.observeToast()
    getToastText()

    // getEnergy()
    // getEnergy1()

    return

    var sumEnergyView = textEndsWith("g").findOne()
    var sumEnergy = sumEnergyView.text()
    var energy = parseInt(sumEnergy)
    SimpleUtils.clickViewCenter(sumEnergyView)
    console.log("sum energy: " + sumEnergy + " " + energy);

    // var mainAccount = text("Chosen.One").findOne()
    // SimpleUtils.clickViewCenter(mainAccount)
    var friend = findWateringFriend("Chosen.One")

    var wateringCount = parseInt(energy / 18)
    console.log("watering count: " + wateringCount);

    var clickType = null
    var count = 3
    while (count > 0) {
        SimpleUtils.clickViewCenter(friend)
        sleep(1500)
        getCurrentUserName()
        console.log("count: " + count + " " + currentUserName);

        if (energy >= 18) {
            clickType = 18
        } else if (energy >= 10) {
            clickType = 10
        } else if (energy >= 5) {
            clickType = 5
        } else if (energy >= 1) {
            clickType = 1
        } else {
            break
        }

        var wateringView = text("浇水").findOne()

        SimpleUtils.clickViewCenter(wateringView)
        sleep(50)
        SimpleUtils.clickViewCenter(wateringView)
        sleep(4000)

        var qwe = clickType + "克"
        console.log(qwe);
        var wateringWeightView = text(qwe).findOne()
        SimpleUtils.clickViewCenter(wateringWeightView)
        sleep(500)

        var actualWateringView = text("浇水送祝福").findOne()
        SimpleUtils.clickViewCenter(actualWateringView)
        sleep(1000)

        SimpleUtils.backActivity()
        count--
        sleep(1000)
    }
}

/**
 * 找到并进入待浇水的好友页面
 * @param {String} friendName 待浇水的好友
 */
function findWateringFriend(friendName) {
    var friendView = text(friendName).findOnce()
    if (friendView) {
        friendView.parent().parent().click()
    } else {
        console.log("在主页面没有找到该好友");

        text("查看更多好友").findOne().click()
        sleep(1500)
        do {
            friendView = text(friendName).findOnce()
            if (friendView) {
                console.log(friendView.bounds().height())
            } else {
                console.log(friendView);
            }

            if (friendView && friendView.bounds().height() > 10) {
                return friendView
            } else {
                friendView = null
            }
            sleep(1500)
            if (!findWebViewAndScroll()) {
                console.log("并没有找到对应好友");
                return null
            }
        } while (friendView == null);
    }
}

/**
 * 在排行榜页面滑动
 */
function findWebViewAndScroll() {
    if (webView == null) {
        webView = className("android.webkit.WebView").findOne()
    }
    if (webView && webView.scrollable()) {
        var scrollResult = webView.scrollForward()
        console.log("WebView scroll result: " + scrollResult)
        return scrollResult
    }
}

/**
 * 获取当前用户名
 */
function getCurrentUserName() {
    var titleView = id("com.alipay.mobile.nebula:id/h5_tv_title").findOne()
    var title = titleView.text()
    console.log("title: " + title);

    if (title.length > 5) {
        currentUserName = title.substring(0, title.length - 5)
    } else {
        currentUserName = "我的"
    }
}

/**
 * 收取自己的能量
 */
function getEnergy() {
    var friendAllButton = findAntForestButton()
    if (friendAllButton.size() > 0) {
        console.log("在" + currentUserName + "界面共找到了" + friendAllButton.size() + "个可收取Button");
        for (let index = 0; index < friendAllButton.length; index++) {
            console.log(index);

            var element = friendAllButton.get(index);
            if (checkButtonEnergy(element)) {
                SimpleUtils.clickViewCenter(element)
                sleep(1000)
            }
        }
    } else {
        console.log("在" + currentUserName + "界面没找到可收取Button");
    }
}

/**
 * 收取所有的能量
 */
function getEnergy1() {

    var alreadyRecordButtonArray = []
    var timeEnergyButtonCount = -1
    var count = 0

    while (timeEnergyButtonCount != alreadyRecordButtonArray.length) {
        count++
        console.log("第 " + count + " 次循环 " + alreadyRecordButtonArray.length);


        timeEnergyButtonCount = 0

        var allLikeButton = findLikeAntForestButton()
        if (allLikeButton.size() > 0) {
            console.log("找到了" + allLikeButton.size() + "个类能量Button");
        } else {
            console.log("并没有找到类能量Button");
        }
        for (let index = 0; index < allLikeButton.size(); index++) {
            var element = allLikeButton[index];
            if (checkButtonEnergy(element)) {
                timeEnergyButtonCount++
                let j = 0
                if (alreadyRecordButtonArray.length > 0) {
                    for (j = 0; j < alreadyRecordButtonArray.length; j++) {
                        var recordButton = alreadyRecordButtonArray[j];
                        if (element.bounds().left == recordButton.bounds().left) {
                            console.log("在第 " + count + " 次循环时找到了之前记录的待收取能量");
                            break
                        }
                    }
                }
                if (j < alreadyRecordButtonArray.length) {
                    console.log("此次是已经记录的待收取能量，跳过此次循环");
                    continue
                }
                SimpleUtils.clickViewCenter(element)
                // click(521, 616)
                sleep(4000)
                console.log("当前Toast: " + currentToastText);

                if (currentToastText) {
                    console.log("记录一个待收取能量");
                    alreadyRecordButtonArray.push(element)
                    currentToastText = null
                }
                sleep(2000)
            }
        }

        console.log("timeEnergyButtonCount: " + timeEnergyButtonCount + " " + alreadyRecordButtonArray.length);
        
    }

    console.log("浇水能量收集完毕");
    toast("浇水能量收集完毕")
}

/**
 * 获取Toast弹出的内容
 */
function getToastText() {
    // events.removeAllListeners()
    var thread = threads.start(function () {
        console.log("get toast text thread started")

        events.onToast(function (toast) {
            currentToastText = toast.getText()
            console.log("Toast内容: " + currentToastText);
        });

        // for (let index = 0; index < 3; index++) {
        //     click(474, 608)
        //     sleep(2000)
        // }
        getEnergy1()

    })

    thread.waitFor()

    // thread.interrupt()
    return thread

    // events.onToast(function (toast) {
    //     console.log("Toast内容: " + toast.getText() + " 包名: " + toast.getPackageName());
    // });
}

/**
 * 收取浇水能量
 */
function getWateringEnergy() {

}

/**
 * 寻找所有的待收能量Button
 */
function findAntForestButton() {
    return className("Button").textStartsWith("收集能量").find()
}

/**
 * 寻找所有的类待收能量Button
 */
function findLikeAntForestButton() {
    // 同样必定能找到，但是如果没有蚂蚁森林底下的Button就可能找不到
    return className("Button").textMatches("\\s*").find()
}

/**
 * 判断界面上的Button是否符合待收能量条件
 * @param {需要判断的Button} button 
 */
function checkButtonEnergy(button) {
    // console.log("height:" + button.bounds().height() + " width:" + button.bounds().width() + " " + button.text() + " " + button.bounds())
    return button.bounds().height() / button.bounds().width() > 1
}

/**
 * 判断界面上的Button是否符合待收能量条件
 * @param {需要判断的Button} button 
 */
function checkButtonEnergy(button) {
    // console.log("height:" + button.bounds().height() + " width:" + button.bounds().width() + " " + button.text() + " " + button.bounds())
    return button.bounds().height() / button.bounds().width() > 1
}

module.exports = Watering
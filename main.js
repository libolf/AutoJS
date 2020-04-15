// AutoJS docs https://hyb1996.github.io/AutoJs-Docs/#/keys?id=ok
// https://github.com/Nick-Hopps/Ant-Forest-autoscript/blob/master/core/Ant_forest.js

var Sports = require('./Sports')
var Utils = require('./Utils')
var SimpleUtils = require('./SimpleUtils')
var Watering = require('./Watering')
var AntForest = require('./Ant-Forest')
var Consts = require('./consts')

// 只有晚上7点后才允许执行运动步数同步
const startWalkTime = 19
const capturePicturePath = "sdcard/capture_screen.png"

var requestedCaptureScreen = false
var mainAccount = "188"
var mainAccountNickName = "Chosen.One"
var currentTimeHour = -1
var currentTimeDay = -1
var isMainAccountResult = Consts.MAIN_ACCOUNT

// openAlipay()

SimpleUtils.showCustomConsole(1000)
requestCaptureScreen()

// 获取当前时间
currentTimeHour = SimpleUtils.getCurrentHourTime()
console.log("current time hour: " + currentTimeHour + "点");
sleep(1000)

currentTimeDay = SimpleUtils.getCurrentDayTime()
console.log("current time day: " + currentTimeDay + "日");
sleep(1000)

// 先确定当前是否是主账号
checkCurrentAccountIsMain()

// AntForest.antForest(isMainAccount, mainAccountNickName)
// Watering.wateringToMainAccount()

do {
    actuallyDoSomething()

    if (isMainAccountResult == Consts.MAIN_ACCOUNT_BUT_NEED_RUN_AGAIN) {
        break
    }

    isMainAccountResult = Utils.changeLoginUser(mainAccount, mainAccountNickName)

    if (isMainAccountResult == Consts.ONLY_MAIN_ACCOUNT) {
        break
    }
} while (isMainAccountResult != Consts.MAIN_ACCOUNT);

if (isMainAccountResult == Consts.ONLY_MAIN_ACCOUNT) {
    backToMainActivity()
    console.log("当前只有一个账号");
    toast("当前只有主账号")
}

console.log("路线已全部走完");
toast("路线已全部走完")

/**
 * 打开支付宝APP
 */
function openAlipay() {
    launchApp("支付宝")
}

/**
 * 实际操作
 * do something
 */
function actuallyDoSomething() {
    // text("运动").findOne().parent().click()
    // // 等待进入支付宝运动界面
    // sleep(4000)
    // SimpleUtils.closeActivity()
    // sleep(500)

    sleep(2000)
    if (currentTimeHour >= startWalkTime) {
        Sports.enterSports()
    }
    sleep(2000)
    AntForest.antForest(isMainAccountResult == Consts.MAIN_ACCOUNT || isMainAccountResult == Consts.MAIN_ACCOUNT_AND_CONTINUE, mainAccountNickName, currentTimeDay)
    sleep(1000)
}

/**
 * 返回支付宝首页
 */
function backToMainActivity() {
    SimpleUtils.backActivity()
    sleep(500)
    SimpleUtils.backActivity()
    sleep(500)
    text("首页").findOne().parent().click()
}

/**
 * 确定当前账号是否是主账号
 */
function checkCurrentAccountIsMain() {
    text("我的").findOne().parent().click()
    sleep(500)
    var currentAccountName = id("com.alipay.android.phone.wealth.home:id/user_account").findOne().text()
    console.log("current account name:" + currentAccountName);
    isMainAccountResult = currentAccountName.indexOf(mainAccount) >= 0 ? Consts.MAIN_ACCOUNT : Consts.NOT_MAIN_ACCOUNT
    console.log("is main account result: " + isMainAccountResult);
    text("首页").findOne().parent().click()
    sleep(500)
}

/**
 * 请求截图权限
 */
function requestCaptureScreen() {
    if (!requestedCaptureScreen) {
        requestedCaptureScreen = images.requestScreenCapture(false)

        if (!requestedCaptureScreen) {
            console.log("未允许截取屏幕，即将退出")
            toast("未允许截取屏幕，即将退出")
            engines.stopAll()
            exit()
            return false
        }

        var countTime = 1
        while (countTime > 0) {
            toast(countTime--)
            sleep(2000)
        }

        return true
    }

    return requestedCaptureScreen
}
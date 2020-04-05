var SimpleUtils = {}

/**
 * 显示自定义位置大小的Console
 */
SimpleUtils.showCustomConsole = function (positionY) {
    console.show()
    sleep(200)
    console.setSize(device.width / 2, 400)
    // console.setSize(device.width, 500)
    if (positionY < 0) {
        console.setPosition(0, 1000)
    } else {
        console.setPosition(250, 0)
        // console.setPosition(0, positionY)
    }
    console.log("设备 width:" + device.width + " height: " + device.height);
}

/**
 * 点击一个View的中心
 */
SimpleUtils.clickViewCenter = function (view) {
    if (view) {
        click(view.bounds().centerX(), view.bounds().centerY())
    }else{
        console.log("click view center null");
    }
}

SimpleUtils.enterActivity = function (view, nextActivityErrorText) {
    actualEnterActivity(view, nextActivityErrorText, enterActivityCallback)
}

function actualEnterActivity(view, nextActivityErrorText, callback) {
    SimpleUtils.clickViewCenter(view)
    sleep(5000)
    if (callback(nextActivityErrorText)) {
        return true
    } else {
        back()
        sleep(1000)
        return actualEnterActivity(view, nextActivityErrorText, callback)
    }
}

function enterActivityCallback(nextActivityErrorText) {
    var errorView = text(nextActivityErrorText).findOne(2000)
    console.log(errorView.visiable());
    
    var result =  errorView== null
    console.log("enterActivityCallback result: " + result);
    sleep(1000)
    return result
}

SimpleUtils.screenCaptureByPath = function (path) {
    captureScreen(path)
}

SimpleUtils.screenCapture = function () {
    return captureScreen()
}

SimpleUtils.closeActivity = function () {
    var closeView = text("关闭").findOnce()
    if (closeView) {
        console.log("text close");
        // closeView.parent().click()
        SimpleUtils.clickViewCenter(closeView)
        return
    }
    closeView = desc("关闭").findOnce()
    if (closeView) {
        console.log("desc close");
        // closeView.parent().click()
        SimpleUtils.clickViewCenter(closeView)
        return
    }
    console.log("key close");
    back()
}

SimpleUtils.backActivity = function () {
    var backView = text("返回").findOnce()
    if (backView) {
        SimpleUtils.clickViewCenter(backView)
        console.log("text back");
        return
    }
    backView = desc("返回").findOnce()
    if (backView) {
        SimpleUtils.clickViewCenter(backView)
        console.log("desc back");
        return
    }
    console.log("key back");
    back()
}

module.exports = SimpleUtils;
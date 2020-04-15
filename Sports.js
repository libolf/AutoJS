var SimpleUtils = require('./SimpleUtils')

var Sports = {}

Sports.enterSports = function () {
    text("运动").findOne().parent().click()
    // 等待进入支付宝运动界面
    sleep(4000)

    var walkButton = text("走路线").findOne()
    // console.log(walkButton);
    SimpleUtils.clickViewCenter(walkButton)

    // 等待进入我的路线界面
    sleep(3000)

    var goButton = findMyWayGoButton()
    if (goButton) {
        takeWalks(walkButton, goButton)
    } else {
        nextWalkLine()
        goButton = findMyWayGoButton()
        takeWalks(walkButton, goButton)
    }
}

function takeWalks(walkButton, goButton) {
    SimpleUtils.clickViewCenter(goButton)
        sleep(5000)

        SimpleUtils.closeActivity()
        sleep(1000)

        SimpleUtils.clickViewCenter(walkButton)
        sleep(3000)

        saveSportPrize()

        nextWalkLine()

        SimpleUtils.closeActivity()
        sleep(1000)
        SimpleUtils.closeActivity()
}

function nextWalkLine() {
    var nextCity = text("下一关").findOnce()
    // 当前路线走完后自动进入下一关
    if (nextCity) {
        SimpleUtils.clickViewCenter(nextCity)
        sleep(2000)
        var enterNextCity = textContains("进入路线").findOne()
        if (enterNextCity) {
            SimpleUtils.clickViewCenter(enterNextCity)
            sleep(2000)
            var joinWalk = text("加入").findOnce()
            if (joinWalk) {
                SimpleUtils.clickViewCenter(joinWalk)
                sleep(2000)
            }
        }
    }
}

/**
 * 寻找在我的路线页面GO按钮
 */
function findMyWayGoButton() {
    var imageList = className("Image").find()
    toast("image个数为" + imageList.size())
    if (imageList.size() > 0) {
        for (let index = 0; index < imageList.size(); index++) {
            var element = imageList.get(index)
            var bound = element.bounds()
            console.log(bound.left + " " + bound.right + " " + device.width / 2);
            if (bound.left < device.width / 2 && bound.right > device.width / 2) {
                toast("找到了GO Button")
                return element
            }
        }
    }

    return null
}

/**
 * 收取走路线的奖励
 */
function saveSportPrize() {
    click(device.width / 2, 200)
    var bluePrizePoint = null
    var yellowPrizePoint = null
    var noneBlue = false
    do {
        // 截屏
        var img = SimpleUtils.screenCapture()

        if (img) {
            // 寻找符合条件的点
            if (!noneBlue) {
                // 蓝色的奖励宝箱
                bluePrizePoint = images.findColor(img, "#6936ee", {
                    region: [0, device.height / 5, device.width, device.height * 4 / 5],
                    threshold: 4
                });
            }
            console.log("blue point:" + bluePrizePoint);
            sleep(500)

            if (bluePrizePoint) {
                actualClickSavePrize(bluePrizePoint)
            } else {
                // 黄色的奖励宝箱
                noneBlue = true
                yellowPrizePoint = images.findColor(img, "#ea482b", {
                    region: [0, device.height / 5, device.width, device.height * 4 / 5],
                    threshold: 4
                });
                console.log("yellow point: " + yellowPrizePoint);
                sleep(500)


                if (yellowPrizePoint) {
                    actualClickSavePrize(yellowPrizePoint)
                }
            }
        }

        console.log("blue is null: " + (bluePrizePoint == null) + " yellow is null: " + (yellowPrizePoint == null));
        sleep(500)
    } while (bluePrizePoint || yellowPrizePoint);
}

/**
 * 在点击奖励后点击收下
 * @param {寻找到的奖励位置} point 
 */
function actualClickSavePrize(point) {
    click(point.x, point.y)
    sleep(1000)
    var saveButton = textContains("收下").findOne()
    SimpleUtils.clickViewCenter(saveButton)
}

/**
 * 关闭当前页面
 */
function clickClose() {
    closeButton = desc("关闭").findOne()
    SimpleUtils.clickViewCenter(closeButton)
}

module.exports = Sports;

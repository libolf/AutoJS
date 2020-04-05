var SimpleUtils = require('./SimpleUtils')

var AntForest = {}

// 收取小手的图片
var tempPath = "sdcard/take.jpg";
// 当前森林的用户名
var currentUserName = "我的"
// 总排行榜的RecyclerView
var recyclerView = null
// 判断是否真正的到达底部
var canAutoScrollAfterSwipe = false
// swipe的滑动距离
var swipeHeight = 0
// 支付宝能量收取小手图片
var forestTakeImage = images.read(tempPath)
// 当前toast内容
var currentToastText = null
// 主账号昵称
var mainAccountNickName = null
// 监控toast线程
var toastObserveThread = null
// 当前好友页收取的能量和
var currentCollectFriendEnergy = 0
// 上次的能量和
var lastCurrentCollectFriendEnergy = -1
// 当前是否是帮收
var currentFindPointIsHelp = false


AntForest.antForest = function (isMainAccount, mainAccount) {

    mainAccountNickName = mainAccount
    if (isMainAccount) {
        currentUserName = mainAccountNickName
    }
    console.log("current account is main account: " + isMainAccount);

    openAntForest()
    // 等待打开蚂蚁森林
    // 待处理打不开蚂蚁森林的情况
    sleep(5000)

    closeAntForestTips()

    toastObserveThread = startToastObserveThread()

    recordAndGetEnergy(isMainAccount)

    if (!isMainAccount) {
        wateringToMainAccount(mainAccount)
        if (toastObserveThread) {
            toastObserveThread.interrupt()
        }
        return
    }

    findAndEnterAllRankingList()
    // 等待进入排行榜页面
    sleep(2000)
    do {
        var findTakePoint
        while (findTakePoint = captureScreenAndFindTakeEnergy()) {
            var loopCount = 0
            do {
                if (loopCount > 0) {
                    currentFindPointIsHelp = false
                }
                lastCurrentCollectFriendEnergy = currentCollectFriendEnergy
                
                enterFriendAvtivity(findTakePoint, isMainAccount)
                // 退出界面
                exitFriendActivity()
                loopCount++
                console.log("last: " + lastCurrentCollectFriendEnergy.toString() + " current: " + currentCollectFriendEnergy.toString() + " is help: " + currentFindPointIsHelp);
            } while (lastCurrentCollectFriendEnergy != currentCollectFriendEnergy || currentFindPointIsHelp);
            currentCollectFriendEnergy = 0
        }
        // var findTakePoint = captureScreenAndFindTakeEnergy()
    } while (findRecyclerViewAndScroll());
    console.log("列表已滑动到底部");
    Toast("列表已滑动到底部")
    SimpleUtils.closeActivity()
}

/**
 * 开启Toast监控线程
 */
function startToastObserveThread() {
    var thread = threads.start(function () {
        events.observeToast()
    })
    thread.waitFor()

    return thread
}

/**
 * 进入蚂蚁森林
 */
function openAntForest() {
    console.log("将要进入蚂蚁森林");
    var antForest = text("蚂蚁森林").findOne()
    // console.log(antForest);
    var clickResult = antForest.parent().click()
    console.log("Ant Forest click result " + clickResult);
}

/**
 * 给指定账号浇水
 * @param {String} mainAccount 主账号名称
 */
function wateringToMainAccount(accountName) {

    var sumEnergyView = textEndsWith("g").findOne()
    var sumEnergy = sumEnergyView.text()
    var energy = parseInt(sumEnergy)
    SimpleUtils.clickViewCenter(sumEnergyView)
    console.log("sum energy: " + sumEnergy + " " + energy);

    var result = findWateringFriend(accountName)
    console.log("find frient result length: " + result);
    
    if (result == null) {
        toast("并没有找到对应好友")
        return
    }
    var friend = result.shift()
    var findType = result.shift(1)

    var wateringCount = parseInt(energy / 18)
    console.log("watering count: " + wateringCount);

    var clickType = null
    var count = 3
    while (count > 0) {
        if (findType == 0) {
            friend.click()
        }else if (findType == 1) {
            SimpleUtils.clickViewCenter(friend)
        }
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
        sleep(2000)

        var findWateringText = clickType.toString() + "克"
        console.log(findWateringText);
        var wateringWeightView = text(findWateringText).findOne()
        SimpleUtils.clickViewCenter(wateringWeightView)
        sleep(500)

        var actualWateringView = text("浇水送祝福").findOne()
        SimpleUtils.clickViewCenter(actualWateringView)
        energy = energy - clickType
        sleep(1000)

        SimpleUtils.backActivity()
        count--
        sleep(1000)
    }

    SimpleUtils.closeActivity()
}

/**
 * 找到并进入待浇水的好友页面
 * @param {String} friendName 待浇水的好友
 */
function findWateringFriend(friendName) {
    var result = []
    var friendView = text(friendName).findOnce()
    if (friendView) {
        // friendView.parent().parent().click()
        result.push(friendView.parent().parent())
        result.push(0)
        return result
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
                result.push(friendView)
                result.push(1)
                return result
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
 * 记录能量时间并收取能量
 */
function recordAndGetEnergy(isMainAccount) {
    sleep(500)

    if (isMainAccount) {
        var toastThreadResult = threads.disposable();
        var workThreadResult = threads.disposable()
    
        var workThread = threads.start(function () {
            var getTextThread = null
            if (currentUserName.equals(mainAccountNickName)) {
                // if (isMainAccount) {
                getTextThread = getToastText(collectWateringEnergyAndRecordTime, toastThreadResult)
            } else if (!currentUserName.equals(mainAccountNickName)) {
                getTextThread = getToastText(recordFriendsEnergyTime, toastThreadResult)
            }
            var result = toastThreadResult.blockedGet()
            getTextThread.interrupt()
            console.log("get toast text result: " + result);
            workThreadResult.setAndNotify(result)
        })
    
        workThread.waitFor()
    
        var workResult = workThreadResult.blockedGet()
        console.log("work result: " + workResult);
    
        workThread.interrupt()
    }
    collectEnergy(isMainAccount)
}

/**
 * 获取Toast弹出的内容
 */
function getToastText(funExec, sum) {
    var thread = threads.start(function () {
        console.log("get toast text thread started")

        events.onToast(function (toast) {
            currentToastText = toast.getText()
            console.log("Toast内容: " + currentToastText + " " + threads.currentThread());
        });

        var result = funExec()
        console.log("funExec result: " + result);

        sum.setAndNotify(result);
    })

    thread.waitFor()

    return thread
}

/**
 * 记录好友待收取能量时间
 */
function recordFriendsEnergyTime() {
    var friendActivityLikeButtonList = findLikeAntForestButton()
    if (friendActivityLikeButtonList.size() > 0) {
        console.log("找到了" + friendActivityLikeButtonList.size() + "个类能量Button");
    } else {
        console.log("并没有找到类能量Button");
    }
    for (let index = 0; index < friendActivityLikeButtonList.length; index++) {
        let element = friendActivityLikeButtonList[index];
        if (checkButtonEnergy(element)) {
            SimpleUtils.clickViewCenter(element)
        }
    }

    return true
}

/**
 * 收取浇水能量并记录待收取能量时间
 */
function collectWateringEnergyAndRecordTime() {
    console.log("collectWateringEnergyAndRecordTime: " + threads.currentThread());

    // 已记录时间View
    var alreadyRecordButtonArray = []
    // 能量Button个数，用来判断是否终止循环，包括浇水能量及待收取能量
    var energyButtonCount = -1
    // 当前循环次数
    var count = 0

    while (energyButtonCount != alreadyRecordButtonArray.length) {
        count++
        console.log("第 " + count + " 次循环 " + alreadyRecordButtonArray.length);

        // 重复收取浇水能量时重置
        energyButtonCount = 0

        var allLikeButton = findLikeAntForestButton()
        if (allLikeButton.size() > 0) {
            console.log("找到了" + allLikeButton.size() + "个类能量Button");
        } else {
            console.log("并没有找到类能量Button");
        }
        for (let index = 0; index < allLikeButton.size(); index++) {
            var element = allLikeButton[index];
            if (checkButtonEnergy(element)) {
                energyButtonCount++
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
                sleep(2000)
                console.log("当前Toast: " + currentToastText);

                if (currentToastText) {
                    console.log("记录一个待收取能量");
                    alreadyRecordButtonArray.push(element)
                    currentToastText = null
                }
                sleep(2000)
            }
        }

        console.log("energyButtonCount: " + energyButtonCount + " " + alreadyRecordButtonArray.length);

    }

    console.log("浇水能量收集完毕");
    toast("浇水能量收集完毕")
    return true
}

/**
 * 收取能量
 */
function collectEnergy(isMainAccount) {
    var friendAllButton = findAntForestButton()
    if (friendAllButton.size() > 0) {
        console.log("在" + currentUserName + "界面共找到了" + friendAllButton.size() + "个可收取Button");
        for (let index = 0; index < friendAllButton.length; index++) {
            console.log(index);

            var element = friendAllButton.get(index);
            if (checkButtonEnergy(element)) {
                clickViewCenter(element)
                sleep(1000)
                if (isMainAccount) {
                    var listView = className("ListView").findOne()
                    if (listView) {
                        var resultParentView = listView.child(1)
                        var collectResultView = resultParentView.findOne(textEndsWith("g"))
                        var text = collectResultView.text()
                        currentCollectFriendEnergy = currentCollectFriendEnergy + parseInt(text.substring(2, text.length - 1))
                        console.log("collect friend energy: " + text + " sum: " + currentCollectFriendEnergy.toString());
                        
                        sleep(1000)
                    }
                }
            }
        }
    } else {
        console.log("在" + currentUserName + "界面没找到可收取Button");
    }
}

/**
 * 寻找并点击总排行榜
 */
function findAndEnterAllRankingList() {
    // 找到总排行榜
    text("总排行榜").findOne().click()
    console.log("找到总排行榜");
    var allRankingText = text("查看更多好友").findOne()
    // 滑动到总排行榜位置
    console.log("点击总排行榜");
    allRankingText.click()
}

/**
 * 在排行榜页面寻找列表
 */
// todo WebView scrollable是true，可以以此来判断是否到底
function findRecyclerViewAndScroll() {
    if (recyclerView == null) {
        recyclerView = className("android.webkit.WebView").findOne()
    }

    if (recyclerView && recyclerView.scrollable()) {
        console.log("recycler view child count: " + recyclerView.childCount());
        // 获取RecyclerView子元素的高度
        if (recyclerView.childCount() > 0 && swipeHeight == 0) {
            console.log("child 0 height: " + recyclerView.child(0).bounds().height());
            swipeHeight = recyclerView.child(0).bounds().height() / 3
        }
        if (swipeHeight == 0) {
            swipeHeight = 400
        }
        console.log("Swipe Height: " + swipeHeight);
        console.log("好友列表准备滑动");
        sleep(500)
        var scrollResult = recyclerView.scrollForward()
        console.log("first scroll result " + scrollResult)
        // 当不能自主滑动时并且还能通过坐标滑动即到达RecyclerView底部
        if (!scrollResult && canAutoScrollAfterSwipe) {
            return false
        } else {
            canAutoScrollAfterSwipe = false
        }
        // 当滑动到底时尝试手动滑动一段距离让其上拉加载
        if (!scrollResult) {
            var swipeResult = swipe(device.width / 2, 750, device.width / 2, 1000 - swipeHeight, 3000)
            console.log("swipe scroll result " + swipeResult)
            canAutoScrollAfterSwipe = swipeResult
            return swipeResult
        }
        return scrollResult
    }
}

/**
 * 将找到的RecyclerView向下滑动
 */
function findedRecyclerViewScroll() {
    if (recyclerView && recyclerView.scrollable()) {
        console.log("好友列表准备滑动");
        console.log(recyclerView.scrollForward())
    }
}

/**
 * 截屏并寻找可收取的好友的位置
 */
function captureScreenAndFindTakeEnergy() {
    console.log("准备申请截图");
    sleep(500)

    var img = SimpleUtils.screenCapture()
    console.log("截图完成");
    sleep(500)

    // var point = images.findColor(img, "#24A676")

    console.log("即将开始寻找有无可收取能量");
    var findImagePoint = images.findImage(img, forestTakeImage)

    if (findImagePoint) {
        console.log("收取能量寻找到的位置: " + findImagePoint);
        currentFindPointIsHelp = false
        return findImagePoint
    } else {
        console.log("收取能量没有找到符合条件的位置");
        sleep(500)
        return findHelpTakeEnergy(img)
        // return null
    }
}

/**
 * 帮好友收取能量
 */
function findHelpTakeEnergy(img) {
    console.log("即将开始寻找有无代收能量");
    var findHelpPoint = images.findColor(img, "#F9973E", {
        region: [device.width / 2, 100, device.width / 2, device.height - 100],
    });
    if (findHelpPoint) {
        console.log("代收能量寻找到的位置: " + findHelpPoint);
        currentFindPointIsHelp = true
        return findHelpPoint
    } else {
        console.log("代收能量没有找到符合条件的位置");
        return null
    }
}

/**
 * 进入好友界面
 */
function enterFriendAvtivity(point, isMainAccount) {
    click(point.x + 20, point.y + 20)
    // 进入具体的好友界面
    currentUserName = textEndsWith("的蚂蚁森林").findOne().text()
    currentUserName = currentUserName.substring(0, currentUserName.length - 5)
    console.log("进入了" + currentUserName + "的蚂蚁森林");
    sleep(2000)
    
    // todo 给好友收能量并且记录时间
    recordAndGetEnergy(isMainAccount)
}

/**
 * 退出好友界面
 */
function exitFriendActivity() {
    // var backButton = id("h5_tv_nav_back").findOne()
    var backButton = desc("返回").findOne()
    // console.log(backButton);
    // backButton.click()
    clickViewCenter(backButton)
}

/**
 * Toast
 * @param {*} text 
 */
function Toast(text) {
    toast(text);
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
    // 同样必定能找到，但是如果没有蚂蚁森林文字底下的Button就可能找不到
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
 * 点击一个可点击View的中心
 * @param {待要点击的Button} button 
 */
function clickViewCenter(view) {
    if (view.clickable()) {
        // toast(view.bounds())
        click(view.bounds().centerX(), view.bounds().centerY())
    }
}

/**
 * 关闭蚂蚁森林提示
 */
function closeAntForestTips() {
    var closeTipsButton = text("关闭").findOnce()
    if (closeTipsButton) {
        closeTipsButton.click()
    }
    console.log("准备点击其他地方消除树上的提示");
    click(device.width / 2, 200);
}

module.exports = AntForest;
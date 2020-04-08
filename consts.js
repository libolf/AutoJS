// 不是主账号
exports.NOT_MAIN_ACCOUNT = 0
// 是主账号
exports.MAIN_ACCOUNT = 1
// 是主账号但是因为主账号在账号列表中是最后一个需要再一次的重复运行
exports.MAIN_ACCOUNT_BUT_NEED_RUN_AGAIN = 2
// 账号列表只有主账号
exports.ONLY_MAIN_ACCOUNT = 3
// 当主账号不是最后一个也不是第一个时需要继续运行但是得满足主账号的所有条件
exports.MAIN_ACCOUNT_AND_CONTINUE = 4
// 本地存储名称
exports.STORAGE_NAME = "ScriptStorage"
// 浇水日期
exports.WATERING_DATE = "watering_date"
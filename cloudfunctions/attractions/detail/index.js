// 云函数入口文件 - 获取景点详情
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 获取景点详情
 * @param {Object} event - 请求参数
 * @param {string} event.id - 景点ID
 */
exports.main = async (event, context) => {
  const { id } = event;

  if (!id) {
    return {
      success: false,
      error: '缺少景点ID'
    };
  }

  try {
    // 获取景点详情
    const result = await db.collection('attractions')
      .doc(id)
      .get();

    // 增加浏览量
    await db.collection('attractions')
      .doc(id)
      .update({
        data: {
          views: _.inc(1),
          updateTime: new Date()
        }
      });

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('获取景点详情失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

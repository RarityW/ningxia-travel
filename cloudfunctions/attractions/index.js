// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 获取景点列表
 * @param {Object} event - 请求参数
 * @param {string} event.type - 景点类型 (全部/5A/4A/历史/自然/文化)
 * @param {number} event.page - 页码
 * @param {number} event.pageSize - 每页数量
 */
exports.main = async (event, context) => {
  const { type = '全部', page = 1, pageSize = 10 } = event;

  try {
    // 构建查询条件
    let query = db.collection('attractions');

    if (type !== '全部') {
      if (type === '5A') {
        query = query.where({
          grade: '5A'
        });
      } else if (type === '4A') {
        query = query.where({
          grade: '4A'
        });
      } else {
        query = query.where({
          category: type
        });
      }
    }

    // 分页查询
    const skip = (page - 1) * pageSize;
    const result = await query
      .orderBy('grade', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();

    // 获取总数
    const countResult = await query.count();

    return {
      success: true,
      data: result.data,
      total: countResult.total,
      page,
      pageSize
    };
  } catch (error) {
    console.error('获取景点列表失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

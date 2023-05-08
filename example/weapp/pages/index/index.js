// index.js
import XCanvas from '../../x-canvas.js'

// 获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData:
      wx.canIUse('open-data.type.userAvatarUrl') &&
      wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }

    const query = wx.createSelectorQuery()
    query
      .select('#myCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node
        const _ctx = canvas.getContext('2d')

        const _dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * _dpr
        canvas.height = res[0].height * _dpr
        // ctx.scale(dpr, dpr)
        const _w = 420
        const _h = 336

        console.log(_ctx, _dpr, _w, _h)

        const { createApp, h } = XCanvas

        const App = h('div', { style: { color: 'red' } }, [
          'hello ',
          h('span', 'world')
        ])
        console.log('App', App)

        const app = createApp(App)
        console.log('app', app)

        app.mount(_ctx, {
          _dpr,
          width: _w,
          height: _h,
          lifecycle: {
            onEffectSuccess: () => {
              // 网络请求完成，比如网络图片加载完成并且重新绘制完毕
            },
            onEffectFail() {
              // 网络请求失败
            }
          }
        })
      })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})

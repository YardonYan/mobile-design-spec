// 预期命中: harmony-font-unit, harmony-px
@Entry @Component struct Bad {
  build() {
    Column() {
      Text("正文").fontSize('16vp').width('812px')
    }
  }
}

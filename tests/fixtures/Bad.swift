// 预期命中: font-min, page-padding
struct Row: View {
  var body: some View {
    Text("说明").font(.system(size: 10)).padding(.horizontal, 12)
  }
}

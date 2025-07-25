@import laifu.fu.lai.data.Page
@param Page page

@template.layout(title = page.getTitle(), content = @`Welcome, ${page.getUser()}.`)
package laifu.fu.lai.controller

import laifu.fu.lai.Page
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping


@Controller
class HomeController {
    @GetMapping("/test")
    fun index(model: Model): String {
        val page = Page(
            title = "JTE 測試",
            user = "cream god",
            description = "這是說明內容"
        )
        model.addAttribute("page", page) // ✅ 這一行很重要
        return "index"  // 對應到 /templates/index.jte 或 .html
    }
}
$("button.tools").on("click", function(){
    if ($("nav").attr("data-active") == "true"){
        $("main").css("flex-shrink", "0")
        $("nav").attr("data-active", "false")
    }else{
        $("main").css("flex-shrink", "1")
        $("nav").attr("data-active", "true")
    }
    
})
(function() {
    document.addEventListener('DOMContentLoaded', function(){
    
      // putting lines by the pre blocks
      // 코드는 줄을 꺾지 않고 가로로 스크롤하므로 줄 번호는 실제 줄 수만큼만 매기고,
      // 번호 칸과 코드를 한 줄짜리 flex 상자(.code-wrap)에 넣어 높이를 맞춘다
      var preElements = document.querySelectorAll("div.highlight > pre");
      preElements.forEach(function(preElement) {
        var pre = preElement.textContent.replace(/\n$/, "").split("\n");
        var lines = [];
        for(var i = 0; i < pre.length; i++) {
          lines.push(i+1);
        }
        var wrapElement = document.createElement("div");
        wrapElement.className = "code-wrap";
        var linesElement = document.createElement("pre");
        linesElement.className = "lines";
        linesElement.setAttribute("aria-hidden", "true");
        linesElement.textContent = lines.join("\n");
        preElement.parentNode.insertBefore(wrapElement, preElement);
        wrapElement.appendChild(linesElement);
        wrapElement.appendChild(preElement);
      });
    
      var headings = [];
    
      var collectHeaders = function(element){
        var rect = element.getBoundingClientRect();
        headings.push({"top": rect.top + window.pageYOffset - 15, "text": element.textContent});
      }
    
      var h1Elements = document.querySelectorAll(".markdown-body h1");
      var h2Elements = document.querySelectorAll(".markdown-body h2");
      var h3Elements = document.querySelectorAll(".markdown-body h3");
      
      if(h1Elements.length > 1) {
        h1Elements.forEach(collectHeaders);
      } else if(h2Elements.length > 1) {
        h2Elements.forEach(collectHeaders);
      } else if(h3Elements.length > 1) {
        h3Elements.forEach(collectHeaders);
      }
    
      window.addEventListener('scroll', function(){
        if(headings.length==0) return true;
        var scrolltop = window.pageYOffset || document.documentElement.scrollTop;
        var currentSection = document.querySelector(".current-section");
        if(headings[0] && scrolltop < headings[0].top) {
          currentSection.style.opacity = "0";
          currentSection.style.visibility = "hidden";
          return false;
        }
        currentSection.style.opacity = "1";
        currentSection.style.visibility = "visible";
        for(var i in headings) {
          if(scrolltop >= headings[i].top) {
            var nameElement = currentSection.querySelector(".name");
            if (nameElement) {
              nameElement.textContent = headings[i].text;
            }
          }
        }
      });
    
      var currentSectionLink = document.querySelector(".current-section a");
      if(currentSectionLink) {
        currentSectionLink.addEventListener('click', function(e){
          e.preventDefault();
          window.scrollTo(0, 0);
          return false;
        });
      }
    });
})()
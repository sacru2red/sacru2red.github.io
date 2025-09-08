(function() {
    document.addEventListener('DOMContentLoaded', function(){
    
      // putting lines by the pre blocks
      var preElements = document.querySelectorAll("pre");
      preElements.forEach(function(preElement) {
        var pre = preElement.textContent.split("\n");
        var lines = new Array(pre.length+1);
        for(var i = 0; i < pre.length; i++) {
          var wrap = Math.floor(pre[i].split("").length / 70)
          if (pre[i]==""&&i==pre.length-1) {
            lines.splice(i, 1);
          } else {
            lines[i] = i+1;
            for(var j = 0; j < wrap; j++) {
              lines[i] += "\n";
            }
          }
        }
        var linesElement = document.createElement("pre");
        linesElement.className = "lines";
        linesElement.textContent = lines.join("\n");
        preElement.parentNode.insertBefore(linesElement, preElement);
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
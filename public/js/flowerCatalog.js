let makeVisible = function() {
  document.getElementById('animate').style = "visibility:visible"
}

let makeInvisible = function() {
  document.getElementById('animate').style = "visibility:hidden"
  setTimeout(makeVisible, 1000)
}

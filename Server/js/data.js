var app = angular.module("DataManagerApp", []);

/*app.config(function ($sceProvider) {
  // Completely disable SCE.  For demonstration purposes only!
  // Do not use in new projects or libraries.
  $sceProvider.enabled(false);
});     Stefan Schanz - prevents that HTML Elements can't be rendered*/

app.controller("UserDataController", function ($scope) {
  $scope.data = [];
  $scope.request = function () {
    setTimeout(() => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/getUsers", true);
      xhr.responseText = "text";
      xhr.onload = function () {
        if (xhr.readyState == xhr.DONE) {
          if (xhr.status == 200) {
            var obj = JSON.parse(xhr.responseText);
            $scope.$apply(function () {
              $scope.data = obj;
            });
          }
        }
      };
      xhr.send();
    });
  };

  $scope.delete = function (id_user) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/deleteUser", false);
    xhr.setRequestHeader("Content-Type", "application/json");
    var sendstr = JSON.stringify({ id_user: id_user });
    xhr.send(sendstr);
    var restxt = xhr.responseText;
    console.log(restxt);
    if (restxt == "Message Deleted!") {
      $scope.data.forEach((element, index) => {
        if (element.idbloguser == id_user) {
          $scope.data.splice(index, 1);
        }
      });
    }
  };

  $scope.sendrequest = setTimeout($scope.request, 100);
});

app.controller("BlogDataController", function ($scope) {
  $scope.data = [];
  $scope.request = function () {
    setTimeout(() => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/getBlogEntries", true);
      xhr.responseText = "text";
      xhr.onload = function () {
        if (xhr.readyState == xhr.DONE) {
          if (xhr.status == 200) {
            var obj = JSON.parse(xhr.responseText);
            $scope.$apply(function () {
              $scope.data = obj;
            });
          }
        }
      };
      xhr.send();
    });
  };
  $scope.sendrequest = setTimeout($scope.request, 100);
});

app.controller("LoginController", function ($scope) {
  $scope.data = "";
  $scope.request = function () {
    setTimeout(() => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/getloggeduser", true);
      xhr.responseText = "text";
      xhr.onload = function () {
        if (xhr.readyState == xhr.DONE) {
          if (xhr.status == 200) {
            var obj = xhr.responseText;
            if (obj.length) {
              $scope.$apply(function () {
                $scope.data = obj;
              });
            }
          }
        }
      };
      xhr.send();
    });
  };
  $scope.logout = function () {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/logout", false);
    xhr.send();
    location.href = "/";
    $scope.data = "";
  };
  $scope.sendrequest = setTimeout($scope.request, 100);
});

app.controller("BlogDataUserController", function ($scope) {
  $scope.data = [];
  $scope.request = function () {
    setTimeout(() => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/listBlogs", true);
      xhr.responseText = "text";
      xhr.onload = function () {
        if (xhr.readyState == xhr.DONE) {
          if (xhr.status == 200) {
            var obj = JSON.parse(xhr.responseText);
            $scope.$apply(function () {
              $scope.data = obj;
            });
          }
        }
      };
      xhr.send();
    });
  };

  $scope.delete = function (id_blog) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/deleteBlogEntry", false);
    xhr.setRequestHeader("Content-Type", "application/json");
    var sendstr = JSON.stringify({ id_blog: id_blog });
    xhr.send(sendstr);
    var restxt = xhr.responseText;
    console.log(restxt);
    if (restxt == "Message Deleted!") {
      $scope.data.forEach((element, index) => {
        if (element.idblogentry == id_blog) {
          $scope.data.splice(index, 1);
        }
      });
    }
  };

  $scope.sendrequest = setTimeout($scope.request, 100);
});

app.controller("AdminController", function ($scope) {
  $scope.data = "";
  $scope.request = function () {
    setTimeout(() => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/getloggeduseradmin", true);
      xhr.responseText = "text";
      xhr.onload = function () {
        if (xhr.readyState == xhr.DONE) {
          if (xhr.status == 200) {
            var obj = xhr.responseText;
            if (obj.length) {
              $scope.$apply(function () {
                if (obj == "true") {
                } else {
                  obj = "";
                }
                $scope.data = obj;
              });
            }
          }
        }
      };
      xhr.send();
    });
  };
  $scope.sendrequest = setTimeout($scope.request, 100);
});

app.controller("");

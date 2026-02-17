(function () {
  function b(a) {
    var c, b = document.createElement("div");
    return b.innerHTML = "<a></a>", b.firstChild.href = a, b.innerHTML = b.innerHTML, c = b.firstChild, c.protocol + "//" + c.host
  }

  function c() {
    var a = navigator.language || navigator.userLanguage,
      b = a.split("-"),
      c = !1;
    return b.length >= 1 && (c = "es" === b[0]), c
  }

  function d(a, b) {
    "." === a.toString().substring(a.length - 1) && (a = a.toString() + "0");
    var d = new RegExp("^\\s*-?(\\d+(\\.\\d{1," + b + "})?|\\.\\d{1," + b + "})\\s*$", "g");
    return -1 === b && (d = new RegExp("^\\s*-?(\\d+(\\.\\d{1,25})?|\\.\\d{1,25})\\s*$", "g")), d.test(a)
  }
  if (!this.VisanetCheckout) {
    this.VisanetCheckout = {};
    var a = document.currentScript || function () {
      var a = document.getElementsByTagName("script");
      return a[a.length - 1];// a[a.length - 1]
    }();
    //console.log('aki la lista de script');
    //console.log(a);
    this.VisanetCheckout.initfp = !1, this.VisanetCheckout.isNumeric = d, this.VisanetCheckout.isSpanish = c(), this.VisanetCheckout.onCI = -1 !== a.src.indexOf("qa=true"), this.VisanetCheckout.onProd = -1 !== b(a.src).indexOf("static-content.vnforapps.com"), this.VisanetCheckout.host = (this.VisanetCheckout.onProd, "https://static-content.vnforapps.com/v1"), this.VisanetCheckout.scriptTag = a
  }
}).call(this),
  function (a) {
    this.VisanetCheckout.validate || (this.VisanetCheckout.validate = {
      inValues: function () {
        for (var a = 1; a < arguments.length; a++)
          if (arguments[a] == arguments[0]) return !0;
        return !1
      },
      preprocess: function (a) {
        var b = !1,
          c = !1,
          d = !1;
        if (null === a || void 0 === a) return null;
        if (null === a.action || void 0 === a.action) return null;
        if (!!a.recurrencetype && this.inValues(a.recurrencetype.toLowerCase(), "fixed", "fixedinitial") || (a.recurrenceamount = a.recurrenceamount ? a.recurrenceamount : "0.00"), a.currency = null === a.currency || void 0 === a.currency ? "PEN" : "USD" !== a.currency ? "PEN" : a.currency, c = void 0 !== a.recurrence && null !== a.recurrence && "true" === a.recurrence.toString().trim().toLowerCase(), b = void 0 !== a.amount && null !== a.amount ? VisanetCheckout.isNumeric(a.amount, 2) : b, d = a.recurrenceamount ? VisanetCheckout.isNumeric(a.recurrenceamount, 2) : d, c) {
          if (!d) return alert("Field recurrenceamount has to be set as a numeric value when recurrence has been set to true."), null;
          !b && d ? (a.amount = a.recurrenceamount, b = !0) : b && !d && (a.recurrenceamount = a.amount, d = !0), a.recurrencetype && (a.recurrencetype = this.inValues(a.recurrencetype.toLowerCase(), "fixed", "fixedinitial", "variable", "variableinitial") ? a.recurrencetype.toLowerCase() : "fixed", a.recurrenceamount = this.inValues(a.recurrencetype.toLowerCase(), "variableinitial", "variable") ? 0 : a.recurrenceamount), a.recurrencefrequency && (a.recurrencefrequency = this.inValues(a.recurrencefrequency.toLowerCase(), "annual", "monthly", "biannual", "quarterly") ? a.recurrencefrequency.toLowerCase() : "monthly")
        } else if (!b) return null;
        return a.isrecurrence = c, a
      },
      combinate: function (a, b) {
        return a && b && (b.amount = a.amount && VisanetCheckout.isNumeric(a.amount, 2) ? a.amount : b.amount, b.currency = a.currency ? a.currency : b.currency, b.merchantlogo = a.merchantlogo ? a.merchantlogo : b.merchantlogo, b.merchantid = a.merchantid ? a.merchantid : b.merchantid, b.merchantname = a.merchantname ? a.merchantname : b.merchantname, b.formbuttoncolor = a.formbuttoncolor ? a.formbuttoncolor : b.formbuttoncolor, b.showamount = a.showamount ? a.showamount : b.showamount, b.purchasenumber = a.purchasenumber ? a.purchasenumber : b.purchasenumber, b.cardholdername = a.cardholdername ? a.cardholdername : b.cardholdername, b.cardholderlastname = a.cardholderlastname ? a.cardholderlastname : b.cardholderlastname, b.cardholderemail = a.cardholderemail ? a.cardholderemail : b.cardholderemail, b.usertoken = a.usertoken ? a.usertoken : b.usertoken, b.recurrence = a.recurrence ? a.recurrence.toLowerCase().trim() : b.recurrence, b.frequency = a.frequency ? a.frequency : b.frequency, b.recurrencetype = a.recurrencetype ? a.recurrencetype : b.recurrencetype, b.recurrenceamount = a.recurrenceamount && VisanetCheckout.isNumeric(a.recurrenceamount, 2) ? a.recurrenceamount : b.recurrenceamount), b
      },
      isValid: function (a) {
        return !!a && (!!(a.merchantid && a.amount && a.currency && a.sessiontoken && a.purchasenumber) || (alert("At a minimum, the action, merchantid, sessiontoken, amount and purchasenumber options have to be set"), !1))
      }
    })
  }.call(this, document),
  function (a) {
    this.VisanetCheckout.utils || (this.VisanetCheckout.utils = {
      bind: function (a, b, c) {
        return a.addEventListener ? a.addEventListener(b, c, !1) : a.attachEvent ? a.attachEvent("on" + b, c) : void 0
      },
      bindFn: function (a, b) {
        return function () {
          return a.apply(b, arguments)
        }
      },
      addJsLink: function (b) {
        var c = a.createElement("script");
        c.src = b, c.type = "text/javascript", a.getElementsByTagName("head")[0].appendChild(c)
      },
      addCssLink: function (b) {
        var c = a.createElement("link");
        c.type = "text/css", c.rel = "stylesheet", c.href = b, a.getElementsByTagName("head")[0].appendChild(c)
      },
      addInput: function (b, c) {
        var d = a.createElement("input");
        return d.type = "hidden", d.value = c, d.name = b, d
      }
    })
  }.call(this, document),
  function () {
    this.VisanetCheckout.ua || (this.VisanetCheckout.ua = {
      userAgent: window.navigator.userAgent,
      isiPhone: function () {
        return /(iPhone|iPod)/i.test(this.userAgent)
      },
      isiOSWebView: function () {
        return /(iPhone|iPod).*AppleWebKit(?!.*Safari)/i.test(this.userAgent)
      },
      isMobileDevice: function () {
        return this.isiPhone() && !this.isiOSWebView()
      }
    })
  }.call(this),
  function () {
    this.VisanetCheckout.Navigator || (this.VisanetCheckout.Navigator = function () {
      function a() { }

      function b() {
        var b, a = navigator.userAgent,
          c = a.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        return /trident/i.test(c[1]) ? (b = /\brv[ :]+(\d+)/g.exec(a) || [], {
          name: "IE",
          version: b[1] || ""
        }) : "Chrome" === c[1] && null != (b = a.match(/\bOPR\/(\d+)/)) ? {
          name: "Opera",
          version: b[1]
        } : (c = c[2] ? [c[1], c[2]] : [navigator.appName, navigator.appVersion, "-?"], null != (b = a.match(/version\/(\d+)/i)) && c.splice(1, 1, b[1]), {
          name: c[0],
          version: c[1]
        })
      }
      return a.isSupportTLS1_2 = function () {
        var a = !0,
          c = b(),
          d = parseInt(c.version);
        switch (c.name.toLowerCase()) {
          case "chrome":
            d < 30 && (a = !1);
            break;
          case "opera":
            d < 17 && (a = !1);
            break;
          case "ie":
          case "msie":
            d < 10 && (a = !1);
            break;
          case "safari":
            d < 7 && (a = !1);
            break;
          case "firefox":
            d < 27 && (a = !1)
        }
        return a
      }, a
    }())
  }.call(this),
  function () {
    if (!this.VisanetCheckout.RPC) {
      var a = this.VisanetCheckout.utils;
      this.VisanetCheckout.RPC = function () {
        function b(b) {
          this.target = b.target, this.type = b.type || "server", this.methods = {}, this.messages = [], this.isReady = !1, a.bind(window, "message", function (a) {
            return function () {
              return a.handleMessage.apply(a, arguments)
            }
          }(this))
        }
        return b.prototype.sendMessage = function (a) {
          data = JSON.stringify(a), this.send(data)
        }, b.prototype.send = function (a) {
          !0 === this.isReady ? this.target.postMessage(a, "*") : this.messages.push(a)
        }, b.prototype.handleMessage = function (a) {
          a.source == this.target && this.processMessage(a.data)
        }, b.prototype.processMessage = function (a) {
          if (message = JSON.parse(a), !0 === message.isReady && !1 === this.isReady) return void this.ready();
          this.methods[message.method] && (this.methods[message.method], !0) && this.methods[message.method].apply(this.methods, message.args)
        }, b.prototype.whenReady = function (a) {
          if (this.isReady) return a();
          this.onReadyCallback = a
        }, b.prototype.ready = function () {
          var a;
          for (this.isReady = !0, this.onReadyCallback && this.onReadyCallback(), this.sendMessage({
            isReady: !0,
            type: this.type
          }); a = this.messages.shift();) this.send(a)
        }, b.prototype.invoke = function () {
          var a, b, c = Array.prototype.slice;
          a = arguments[0], b = c.call(arguments, 1), this.sendMessage({
            method: a,
            args: b
          })
        }, b
      }()
    }
  }.call(this),
  function (a) {
    if (!this.VisanetCheckout.Iframe) {
      var b = this.VisanetCheckout.RPC,
        c = this.VisanetCheckout.utils,
        d = this.VisanetCheckout;
      this.VisanetCheckout.Iframe = function () {
        function n() {
          if (e = a.getElementsByTagName("head")[0], f = a.querySelector("meta[name=viewport]"), g = "", h = a.body, i = a.documentElement, j = i.style.cssText || "", k = h.style.cssText || "", l = "position: relative; overflow: hidden; height: 100%", !f) {
            var b = a.createElement("meta");
            b.name = "viewport", b.content = "", e.appendChild(b), f = b
          }
          g = f.getAttribute("content"), m = h.scrollTop, f.setAttribute("content", "width=device-width, user-scalable=no"), h.style.cssText = l, i.style.cssText = l
        }

        function o() {
          f.setAttribute("content", g), h.style.cssText = j, i.style.cssText = k, h.scrollTop = m
        }

        function p() {
          var a = d.host + "/visanet.html?" + Math.random();
          d.onCI && (a += "&qa=true"), this.opened = !1, this.src = a, this.iframe = this.addIframe(), this.rpc = new b({
            target: this.iframe.contentWindow,
            type: "server"
          }), this.rpc.methods.cancel = c.bindFn(this.cancel, this), this.rpc.methods.addfingerprint = c.bindFn(this.addfingerprint, this), this.rpc.methods.close = c.bindFn(this.close, this), this.rpc.methods.complete = c.bindFn(this.complete, this)
        }
        var e, f, g, i, h, j, k, l, m, h = a.body;
        return p.prototype.config = function (a) {
          this.configuration = a || (a = {}), this.rpc.invoke("config", this.configuration)
        }, p.prototype.open = function (a) {
          this.opened || (this.opened = !0, n(), this.iframe.style.display = "block", console.log("iframe display block"), this.rpc.invoke("open", a))
        }, p.prototype.complete = function (a) {
          this.configuration.complete(a)
        }, p.prototype.addfingerprint = function (a) {
          try {
            d.initfp || (initDFP(a.sessiontoken, a.purchasenumber, a.clientip, a.merchantid), d.initfp = !0)
          } catch (a) { }
        }, p.prototype.cancel = function () {
          this.close(), this.configuration.cancel && this.configuration.cancel()
        }, p.prototype.close = function () {
          this.opened = !1, this.iframe.style.display = "none", a.body.className = a.body.className.replace("visanet-opened", ""), o()
        }, p.prototype.addIframe = function () {
          var b, d = a.createElement("div");
          return d.id = "visaNetWrapper", b = a.createElement("iframe"), b.id = "visaNetJS", b.setAttribute("frameBorder", "0"), b.setAttribute("allowtransparency", "true"), b.style.cssText = "z-index: 2147483646;\ndisplay: none;\nbackground: transparent;\nbackground: rgba(0,0,0,0.005);\nborder: 0px none transparent;\noverflow-x: hidden;\noverflow-y: auto;\nvisibility: hidden;\nmargin: 0;\npadding: 0;\n-webkit-tap-highlight-color: transparent;\n-webkit-touch-callout: none; position: fixed;\nleft: 0;\ntop: 0;\nwidth: 100%;\nheight: 100%;", b.src = this.src, d.appendChild(b), a.body.appendChild(d), c.bind(b, "load", function () {
            b.style.visibility = "visible"
          }), b
        }, p
      }()
    }
  }.call(this, document),
  function (a) {
    if (!this.VisanetCheckout.Tab) {
      var b = this.VisanetCheckout.RPC,
        c = this.VisanetCheckout.utils,
        d = this.VisanetCheckout;
      this.VisanetCheckout.Tab = function () {
        function a() {
          var a = d.host + "/visanet.html?" + Math.random();
          d.onCI && (a += "&ci=true"), this.opened = !1, this.src = a
        }
        return a.prototype.config = function (a) {
          this.configuration = a || (a = {}), this.configuration.inTab = !0
        }, a.prototype.open = function (a) {
          this.opened || (this.opened = !0, this.createTab(), this.rpc.invoke("config", this.configuration), this.rpc.invoke("open", a))
        }, a.prototype.createTab = function () {
          var a = this;
          this.tab = window.open(this.src, "btfljs"), this.rpc = new b({
            target: this.tab,
            type: "server"
          }), this.rpc.methods.cancel = c.bindFn(this.cancel, this), this.rpc.methods.addfingerprint = c.bindFn(this.addfingerprint, this), this.rpc.methods.complete = c.bindFn(this.complete, this), this.rpc.whenReady(function () {
            a.checkIfClosed()
          })
        }, a.prototype.checkIfClosed = function () {
          var a = this;
          this.checkInterval && clearInterval(this.checkInterval), this.checkInterval = setInterval(function () {
            a.tab.closed && a.close()
          }, 1e3)
        }, a.prototype.complete = function (a) {
          this.close(), this.configuration.complete(a)
        }, a.prototype.cancel = function () {
          this.close(), this.configuration.cancel && this.configuration.cancel()
        }, a.prototype.close = function () {
          clearInterval(this.checkInterval), this.opened = !1, this.tab.closed || this.tab.close()
        }, a
      }()
    }
  }.call(this, document),
  function (a) {
    if (!this.VisanetCheckout.View) {
      var b = this.VisanetCheckout.ua,
        c = this.VisanetCheckout;
      this.VisanetCheckout.getView = function (a) {
        return b.isMobileDevice() && a.tabOnMobile ? c.Tab : c.Iframe
      }
    }
  }.call(this, document),
  function () {
    var a = "Sorry, but you can't make payment using this browser as its version is considered unsecure. Please, use latest version of your browser or download and install latest version of free Firefox / Chrome.";
    this.VisanetCheckout.Checkout || (!1 === this.VisanetCheckout.Navigator.isSupportTLS1_2() && alert(a), this.VisanetCheckout.Checkout = function () {
      function c() { }
      if (!1 === VisanetCheckout.Navigator.isSupportTLS1_2()) return c.config = function (a) { }, c.open = function (b) {
        alert(a)
      }, c;
      this.VisanetCheckout.utils.addJsLink(this.VisanetCheckout.onCI ? this.VisanetCheckout.host + "/js/dev_dfp.js" : this.VisanetCheckout.host + "/js/prd_dfp.js");
      var d;
      return c.config = function (a) {
        var b = this,
          c = this.validate,
          e = this.utils;
        (a = c.preprocess(a)) && c.isValid(a) && (this.configuration = a, this.configuration.complete = function (a) {
          var c = document.createElement("form");
          c.appendChild(e.addInput("transactionToken", a.token)), c.appendChild(e.addInput("customerEmail", a.email)), c.appendChild(e.addInput("channel", a.channel)), c.method = "POST", c.action = b.configuration.action, document.body.appendChild(c), c.submit()
        }, void 0 === d && (viewClass = VisanetCheckout.getView(a), d = new viewClass), d.config(a))
      }, c.open = function (a) {
        var b = this.validate;
        this.configuration ? a ? (this.configuration = b.combinate(a, this.configuration), this.configuration = b.preprocess(this.configuration), this.configuration && b.isValid(this.configuration) && (d.config(this.configuration), d.open(this.configuration))) : d.open(this.configuration) : alert("At a minimum, the action, merchantid, sessiontoken, amount and purchasenumber options have to be set")
      }, c
    }())
  }.call(this),
  function () {
    if (!this.VisanetCheckout.Button) {
      var a = this.VisanetCheckout.utils,
        b = this.VisanetCheckout,
        c = window.attachEvent && !window.addEventListener;
      b.Button = function () {
        function d(c, d) {
          this.form = c, this.complete = a.bindFn(this.complete, this), this.open = a.bindFn(this.open, this), this.cancel = a.bindFn(this.cancel, this), this.config = d, this.config.complete = this.complete, this.config.cancel = this.cancel, this.config.tabOnMobile = !1, this.params = {
            amount: d.amount,
            currency: d.currency,
            cardholderemail: d.cardholderemail,
            cardholdername: d.cardholdername,
            cardholderlastname: d.cardholderlastname,
            sessiontoken: d.sessiontoken,
            purchasenumber: d.purchasenumber
          }, b.configure(this.config), this.render()
        }
        return d.prototype.render = function () {
          var c = b.host + "/img/button/",
            d = !!this.config.recurrence && "true" === this.config.recurrence.toString().trim().toLowerCase();
          a.addCssLink(b.host + "/css/button.css"),
            this.btn = document.createElement("button"),
            this.btn.setAttribute("type", "submit"),
            this.config.buttonsize = this.config.buttonsize ? this.config.buttonsize.trim().toLowerCase() : "default",
            this.config.buttoncolor = this.config.buttoncolor ? this.config.buttoncolor.trim().toLowerCase() : "navy",
            b.validate.inValues(this.config.buttonsize, "small", "medium", "large") || (this.config.buttonsize = "default"),
            b.validate.inValues(this.config.buttoncolor, "navy", "gray") || (this.config.buttoncolor = "navy"),
            this.btn.className = "start-js-btn modal-opener " + (this.config.buttonsize ? this.config.buttonsize : "default"),
            this.btn.style = "true" === this.config.custom ? "display:none;" : "",
            c += b.isSpanish ? "ES/" : "EN/",
            c += this.config.buttoncolor,
            c += "/" + this.config.buttonsize + (d ? "/SubscribeWith.png" : "/PayWith.png"),
            this.btn.style.background = 'url("' + c + '")',
            a.bind(this.btn, "click", this.open),
            this.form.appendChild(this.btn)
        }, d.prototype.open = function (a) {
          return a.preventDefault ? a.preventDefault() : a.returnValue = !1, c ? alert("Due to security reasons please, use modern browser (IE11, FireFox, Chrome or Safari) to make payment!") : (navigator.userAgent.match(/iPhone|iPad|iPod/i) && (window.scrollTo(0, 0), document.body.className += "visanet-opened"), b.open(this.params)), !1
        }, d.prototype.complete = function (b) {
          this.form.appendChild(a.addInput("transactionToken", b.token)), this.form.appendChild(a.addInput("customerEmail", b.email)), this.form.appendChild(a.addInput("channel", b.channel)), this.form.submit()
        }, d.prototype.cancel = function () { }, d
      }()
    }
  }.call(this),
  function () {
    this.VisanetCheckout.open || (this.VisanetCheckout.open = this.VisanetCheckout.Checkout.open, this.VisanetCheckout.configure = this.VisanetCheckout.Checkout.config)
  }.call(this),
  function () {
    function j(a) {
      function b(a, b) {
        return b.toUpperCase()
      }
      return a.replace(/(?:[-_])(\w)/g, b)
    }
    if (!this.VisanetCheckout.auto) {
      this.VisanetCheckout.auto = !0;
      var a = this.VisanetCheckout.scriptTag,
        b = document.body.getElementsByTagName("FORM")[0],// document.body.getElementsByTagName("FORM")[0], //a.parentElement,// document.body.getElementsByTagName("FORM")[0],// a.parentElement,
        c = {};
      //console.log('antes del padre');
      //console.log(a);
      if ("FORM" == b.tagName) {
        var d, e, f = "action";
        for (i = 0; i < a.attributes.length; i++) d = a.attributes[i], null !== (e = d.name.match(/^data-(.+)$/)) && (paramName = j(e[1]), c[paramName] = d.value);
        var g = b.getAttribute(f);
        if (c[f] = g, void 0 !== c && null !== c) {
          c.tabOnMobile = !1;
          new this.VisanetCheckout.Button(b, c)
        }
      }
    }
  }.call(this);

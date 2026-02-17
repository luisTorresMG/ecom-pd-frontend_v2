(function() {
  if (!this.VisanetCheckout) {
      this.VisanetCheckout = {};
      var t, e, n, i, o, r, s = document.currentScript || (t = document.getElementsByTagName("script"))[t.length - 1];
      this.VisanetCheckout.initfp = !1, this.VisanetCheckout.isNumeric = function(t, e) {
          "." === t.toString().substring(t.length - 1) && (t = t.toString() + "0");
          var n = new RegExp("^\\s*-?(\\d+(\\.\\d{1," + e + "})?|\\.\\d{1," + e + "})\\s*$", "g");
          return -1 === e && (n = new RegExp("^\\s*-?(\\d+(\\.\\d{1,25})?|\\.\\d{1,25})\\s*$", "g")), n.test(t)
      }, this.VisanetCheckout.isSpanish = (e = (navigator.language || navigator.userLanguage).split("-"), n = !1, e.length >= 1 && (n = "es" === e[0]), n), this.VisanetCheckout.onCI = -1 !== s.src.indexOf("qa=true"), this.VisanetCheckout.onProd = -1 !== (i = s.src, r = document.createElement("div"), r.innerHTML = "<a></a>", r.firstChild.href = i, r.innerHTML = r.innerHTML, (o = r.firstChild).protocol + "//" + o.host).indexOf("static-content.vnforapps.com"), this.VisanetCheckout.host = this.VisanetCheckout.onProd ? "https://static-content.vnforapps.com/v1" : "https://static-content-qas.vnforapps.com/vMigrated", this.VisanetCheckout.scriptTag = s
  }
}).call(this),
  function(t) {
      this.VisanetCheckout.validate || (this.VisanetCheckout.validate = {
          inValues: function() {
              for (var t = 1; t < arguments.length; t++)
                  if (arguments[t] == arguments[0]) return !0;
              return !1
          },
          preprocess: function(t) {
              var e, n = !1,
                  i = !1;
              if (null == t) return null;
              if (null === t.action || void 0 === t.action) return null;
              if (!!t.recurrencetype && this.inValues(t.recurrencetype.toLowerCase(), "fixed", "fixedinitial") || (t.recurrenceamount = t.recurrenceamount ? t.recurrenceamount : "0.00"), t.currency = null === t.currency || void 0 === t.currency ? "PEN" : "USD" !== t.currency ? "PEN" : t.currency, e = void 0 !== t.recurrence && null !== t.recurrence && "true" === t.recurrence.toString().trim().toLowerCase(), n = void 0 !== t.amount && null !== t.amount ? VisanetCheckout.isNumeric(t.amount, 2) : n, i = t.recurrenceamount ? VisanetCheckout.isNumeric(t.recurrenceamount, 2) : i, e) {
                  if (!i) return alert("Field recurrenceamount has to be set as a numeric value when recurrence has been set to true."), null;
                  !n && i ? (t.amount = t.recurrenceamount, n = !0) : n && !i && (t.recurrenceamount = t.amount, i = !0), t.recurrencetype && (t.recurrencetype = this.inValues(t.recurrencetype.toLowerCase(), "fixed", "fixedinitial", "variable", "variableinitial") ? t.recurrencetype.toLowerCase() : "fixed", t.recurrenceamount = this.inValues(t.recurrencetype.toLowerCase(), "variableinitial", "variable") ? 0 : t.recurrenceamount), t.recurrencefrequency && (t.recurrencefrequency = this.inValues(t.recurrencefrequency.toLowerCase(), "annual", "monthly", "biannual", "quarterly") ? t.recurrencefrequency.toLowerCase() : "monthly")
              } else if (!n) return null;
              return t.isrecurrence = e, t
          },
          combinate: function(t, e) {
              return t && e && (e.amount = t.amount && VisanetCheckout.isNumeric(t.amount, 2) ? t.amount : e.amount, e.currency = t.currency ? t.currency : e.currency, e.merchantlogo = t.merchantlogo ? t.merchantlogo : e.merchantlogo, e.merchantid = t.merchantid ? t.merchantid : e.merchantid, e.merchantname = t.merchantname ? t.merchantname : e.merchantname, e.formbuttoncolor = t.formbuttoncolor ? t.formbuttoncolor : e.formbuttoncolor, e.showamount = t.showamount ? t.showamount : e.showamount, e.purchasenumber = t.purchasenumber ? t.purchasenumber : e.purchasenumber, e.cardholdername = t.cardholdername ? t.cardholdername : e.cardholdername, e.cardholderlastname = t.cardholderlastname ? t.cardholderlastname : e.cardholderlastname, e.cardholderemail = t.cardholderemail ? t.cardholderemail : e.cardholderemail, e.usertoken = t.usertoken ? t.usertoken : e.usertoken, e.recurrence = t.recurrence ? t.recurrence.toLowerCase().trim() : e.recurrence, e.frequency = t.frequency ? t.frequency : e.frequency, e.recurrencetype = t.recurrencetype ? t.recurrencetype : e.recurrencetype, e.recurrenceamount = t.recurrenceamount && VisanetCheckout.isNumeric(t.recurrenceamount, 2) ? t.recurrenceamount : e.recurrenceamount, e.hidexbutton = t.hidexbutton ? t.hidexbutton.trim().toLowerCase() : e.hidexbutton ? e.hidexbutton.trim().toLowerCase() : "false"), e
          },
          isValid: function(t) {
              return !!t && (!!(t.merchantid && t.amount && t.currency && t.sessiontoken && t.purchasenumber) || (alert("At a minimum, the action, merchantid, sessiontoken, amount and purchasenumber options have to be set"), !1))
          }
      })
  }.call(this, document),
  function(t) {
      this.VisanetCheckout.utils || (this.VisanetCheckout.utils = {
          bind: function(t, e, n) {
              return t.addEventListener ? t.addEventListener(e, n, !1) : t.attachEvent ? t.attachEvent("on" + e, n) : void 0
          },
          bindFn: function(t, e) {
              return function() {
                  return t.apply(e, arguments)
              }
          },
          addJsLink: function(e) {
              var n = t.createElement("script");
              n.src = e, n.type = "text/javascript", t.getElementsByTagName("head")[0].appendChild(n)
          },
          addCssLink: function(e) {
              var n = t.createElement("link");
              n.type = "text/css", n.rel = "stylesheet", n.href = e, t.getElementsByTagName("head")[0].appendChild(n)
          },
          addInput: function(e, n) {
              var i = t.createElement("input");
              return i.type = "hidden", i.value = n, i.name = e, i
          }
      })
  }.call(this, document),
  function() {
      this.VisanetCheckout.ua || (this.VisanetCheckout.ua = {
          userAgent: window.navigator.userAgent,
          isiPhone: function() {
              return /(iPhone|iPod)/i.test(this.userAgent)
          },
          isiOSWebView: function() {
              return /(iPhone|iPod).*AppleWebKit(?!.*Safari)/i.test(this.userAgent)
          },
          isMobileDevice: function() {
              return this.isiPhone() && !this.isiOSWebView()
          }
      })
  }.call(this),
  function() {
      this.VisanetCheckout.Navigator || (this.VisanetCheckout.Navigator = function() {
          function t() {}
          return t.isSupportTLS1_2 = function() {
              var t = !0,
                  e = function() {
                      var t, e = navigator.userAgent,
                          n = e.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
                      if (/trident/i.test(n[1])) return {
                          name: "IE",
                          version: (t = /\brv[ :]+(\d+)/g.exec(e) || [])[1] || ""
                      };
                      if ("Chrome" === n[1] && null != (t = e.match(/\bOPR\/(\d+)/))) return {
                          name: "Opera",
                          version: t[1]
                      };
                      n = n[2] ? [n[1], n[2]] : [navigator.appName, navigator.appVersion, "-?"], null != (t = e.match(/version\/(\d+)/i)) && n.splice(1, 1, t[1]);
                      return {
                          name: n[0],
                          version: n[1]
                      }
                  }(),
                  n = parseInt(e.version);
              switch (e.name.toLowerCase()) {
                  case "chrome":
                      n < 30 && (t = !1);
                      break;
                  case "opera":
                      n < 17 && (t = !1);
                      break;
                  case "ie":
                  case "msie":
                      n < 10 && (t = !1);
                      break;
                  case "safari":
                      n < 7 && (t = !1);
                      break;
                  case "firefox":
                      n < 27 && (t = !1)
              }
              return t
          }, t
      }())
  }.call(this),
  function() {
      if (!this.VisanetCheckout.RPC) {
          var t = this.VisanetCheckout.utils;
          this.VisanetCheckout.RPC = function() {
              function e(e) {
                  var n;
                  this.target = e.target, this.type = e.type || "server", this.methods = {}, this.messages = [], this.isReady = !1, t.bind(window, "message", (n = this, function() {
                      return n.handleMessage.apply(n, arguments)
                  }))
              }
              return e.prototype.sendMessage = function(t) {
                  data = JSON.stringify(t), this.send(data)
              }, e.prototype.send = function(t) {
                  !0 === this.isReady ? this.target.postMessage(t, "*") : this.messages.push(t)
              }, e.prototype.handleMessage = function(t) {
                  t.source == this.target && this.processMessage(t.data)
              }, e.prototype.processMessage = function(t) {
                  message = JSON.parse(t), !0 !== message.isReady || !1 !== this.isReady ? this.methods[message.method] && (this.methods[message.method], 1) && this.methods[message.method].apply(this.methods, message.args) : this.ready()
              }, e.prototype.whenReady = function(t) {
                  if (this.isReady) return t();
                  this.onReadyCallback = t
              }, e.prototype.ready = function() {
                  var t;
                  for (this.isReady = !0, this.onReadyCallback && this.onReadyCallback(), this.sendMessage({
                          isReady: !0,
                          type: this.type
                      }); t = this.messages.shift();) this.send(t)
              }, e.prototype.invoke = function() {
                  var t, e, n = Array.prototype.slice;
                  t = arguments[0], e = n.call(arguments, 1), this.sendMessage({
                      method: t,
                      args: e
                  })
              }, e
          }()
      }
  }.call(this),
  function(t) {
      if (!this.VisanetCheckout.Iframe) {
          var e = this.VisanetCheckout.RPC,
              n = this.VisanetCheckout.utils,
              i = this.VisanetCheckout;
          this.VisanetCheckout.Iframe = function() {
              var o, r, s, a, c, u, h, l, d = t.body;

              function p() {
                  var t = i.host + "/visanet.html?" + Math.random();
                  i.onCI && (t += "&qa=true"), this.opened = !1, this.src = t, this.iframe = this.addIframe(), this.rpc = new e({
                      target: this.iframe.contentWindow,
                      type: "server"
                  }), this.rpc.methods.cancel = n.bindFn(this.cancel, this), this.rpc.methods.addfingerprint = n.bindFn(this.addfingerprint, this), this.rpc.methods.qrcomplete = n.bindFn(this.qrcomplete, this), this.rpc.methods.close = n.bindFn(this.close, this), this.rpc.methods.complete = n.bindFn(this.complete, this)
              }
              return p.prototype.config = function(t) {
                  this.configuration = t || (t = {}), this.rpc.invoke("config", this.configuration)
              }, p.prototype.open = function(e) {
                  this.opened || (this.opened = !0, function() {
                      if (o = t.getElementsByTagName("head")[0], r = t.querySelector("meta[name=viewport]"), s = "", d = t.body, a = t.documentElement, c = a.style.cssText || "", u = d.style.cssText || "", h = "position: relative; overflow: hidden; height: 100%", !r) {
                          var e = t.createElement("meta");
                          e.name = "viewport", e.content = "", o.appendChild(e), r = e
                      }
                      s = r.getAttribute("content"), l = d.scrollTop, r.setAttribute("content", "width=device-width, user-scalable=no"), d.style.cssText = h, a.style.cssText = h
                  }(), this.iframe.style.display = "block", console.log("iframe display block"), this.rpc.invoke("open", e))
              }, p.prototype.complete = function(t) {
                  this.configuration.complete(t)
              }, p.prototype.qrcomplete = function(t) {
                  try {
                      console.log(JSON.stringify(t)), window.location.replace(t.url)
                  } catch (t) {
                      console.log(t)
                  }
              }, p.prototype.addfingerprint = function(t) {
                  try {
                      i.initfp || (initDFP(t.sessiontoken, t.purchasenumber, t.clientip, t.merchantid), i.initfp = !0)
                  } catch (t) {}
              }, p.prototype.cancel = function() {
                  this.close(), this.configuration.cancel && this.configuration.cancel()
              }, p.prototype.close = function() {
                  this.opened = !1, this.iframe.style.display = "none", t.body.className = t.body.className.replace("visanet-opened", ""), r.setAttribute("content", s), d.style.cssText = c, a.style.cssText = u, d.scrollTop = l
              }, p.prototype.addIframe = function() {
                  var e, i = t.createElement("div");
                  return i.id = "visaNetWrapper", (e = t.createElement("iframe")).id = "visaNetJS", e.setAttribute("frameBorder", "0"), e.setAttribute("allowtransparency", "true"), e.style.cssText = "z-index: 2147483646;\ndisplay: none;\nbackground: transparent;\nbackground: rgba(0,0,0,0.005);\nborder: 0px none transparent;\noverflow-x: hidden;\noverflow-y: auto;\nvisibility: hidden;\nmargin: 0;\npadding: 0;\n-webkit-tap-highlight-color: transparent;\n-webkit-touch-callout: none; position: fixed;\nleft: 0;\ntop: 0;\nwidth: 100%;\nheight: 100%;", e.src = this.src, i.appendChild(e), t.body.appendChild(i), n.bind(e, "load", function() {
                      e.style.visibility = "visible"
                  }), e
              }, p
          }()
      }
  }.call(this, document),
  function(t) {
      if (!this.VisanetCheckout.Tab) {
          var e = this.VisanetCheckout.RPC,
              n = this.VisanetCheckout.utils,
              i = this.VisanetCheckout;
          this.VisanetCheckout.Tab = function() {
              function t() {
                  var t = i.host + "/visanet.html?" + Math.random();
                  i.onCI && (t += "&ci=true"), this.opened = !1, this.src = t
              }
              return t.prototype.config = function(t) {
                  this.configuration = t || (t = {}), this.configuration.inTab = !0
              }, t.prototype.open = function(t) {
                  this.opened || (this.opened = !0, this.createTab(), this.rpc.invoke("config", this.configuration), this.rpc.invoke("open", t))
              }, t.prototype.createTab = function() {
                  var t = this;
                  this.tab = window.open(this.src, "btfljs"), this.rpc = new e({
                      target: this.tab,
                      type: "server"
                  }), this.rpc.methods.cancel = n.bindFn(this.cancel, this), this.rpc.methods.addfingerprint = n.bindFn(this.addfingerprint, this), this.rpc.methods.qrcomplete = n.bindFn(this.qrcomplete, this), this.rpc.methods.complete = n.bindFn(this.complete, this), this.rpc.whenReady(function() {
                      t.checkIfClosed()
                  })
              }, t.prototype.checkIfClosed = function() {
                  var t = this;
                  this.checkInterval && clearInterval(this.checkInterval), this.checkInterval = setInterval(function() {
                      t.tab.closed && t.close()
                  }, 1e3)
              }, t.prototype.complete = function(t) {
                  this.close(), this.configuration.complete(t)
              }, t.prototype.addfingerprint = function(t) {
                  try {
                      i.initfp || (initDFP(t.sessiontoken, t.purchasenumber, t.clientip, t.merchantid), i.initfp = !0)
                  } catch (t) {}
              }, t.prototype.qrcomplete = function(t) {
                  try {
                      console.log(JSON.stringify(t)), window.location.replace(t.url)
                  } catch (t) {
                      console.log(t)
                  }
              }, t.prototype.cancel = function() {
                  this.close(), this.configuration.cancel && this.configuration.cancel()
              }, t.prototype.close = function() {
                  clearInterval(this.checkInterval), this.opened = !1, this.tab.closed || this.tab.close()
              }, t
          }()
      }
  }.call(this, document),
  function(t) {
      if (!this.VisanetCheckout.View) {
          var e = this.VisanetCheckout.ua,
              n = this.VisanetCheckout;
          this.VisanetCheckout.getView = function(t) {
              return e.isMobileDevice() && t.tabOnMobile ? n.Tab : n.Iframe
          }
      }
  }.call(this, document),
  function() {
      var t = "Sorry, but you can't make payment using this browser as its version is considered unsecure. Please, use latest version of your browser or download and install latest version of free Firefox / Chrome.";
      this.VisanetCheckout.Checkout || (!1 === this.VisanetCheckout.Navigator.isSupportTLS1_2() && alert(t), this.VisanetCheckout.Checkout = function() {
          var e;

          function n() {}
          return !1 === VisanetCheckout.Navigator.isSupportTLS1_2() ? (n.config = function(t) {}, n.open = function(e) {
              alert(t)
          }, n) : (this.VisanetCheckout.utils.addJsLink(this.VisanetCheckout.onCI ? this.VisanetCheckout.host + "/js/dev_dfp.js" : this.VisanetCheckout.host + "/js/prd_dfp.js"), n.config = function(t) {
              var n = this,
                  i = this.validate,
                  o = this.utils;
              (t = i.preprocess(t)) && i.isValid(t) && (this.configuration = t, this.configuration.complete = function(t) {
                  var e = document.createElement("form");
                  e.appendChild(o.addInput("transactionToken", t.token)), e.appendChild(o.addInput("customerEmail", t.email)), e.appendChild(o.addInput("channel", t.channel)), e.method = "POST", e.action = n.configuration.action, document.body.appendChild(e), e.submit()
              }, void 0 === e && (viewClass = VisanetCheckout.getView(t), e = new viewClass), e.config(t))
          }, n.open = function(t) {
              var n = this.validate;
              this.configuration ? t ? (this.configuration = n.combinate(t, this.configuration), this.configuration = n.preprocess(this.configuration), this.configuration && n.isValid(this.configuration) && (e.config(this.configuration), e.open(this.configuration))) : e.open(this.configuration) : alert("At a minimum, the action, merchantid, sessiontoken, amount and purchasenumber options have to be set")
          }, n)
      }())
  }.call(this),
  function() {
      if (!this.VisanetCheckout.Button) {
          var t = this.VisanetCheckout.utils,
              e = this.VisanetCheckout,
              n = window.attachEvent && !window.addEventListener;
          e.Button = function() {
              function i(n, i) {
                  this.form = n, this.complete = t.bindFn(this.complete, this), this.open = t.bindFn(this.open, this), this.cancel = t.bindFn(this.cancel, this), this.config = i, this.config.complete = this.complete, this.config.cancel = this.cancel, this.config.tabOnMobile = !1, this.params = {
                      amount: i.amount,
                      currency: i.currency,
                      cardholderemail: i.cardholderemail,
                      cardholdername: i.cardholdername,
                      cardholderlastname: i.cardholderlastname,
                      sessiontoken: i.sessiontoken,
                      purchasenumber: i.purchasenumber
                  }, e.configure(this.config), this.render()
              }
              return i.prototype.render = function() {
                  var n = e.host + "/img/button/",
                      i = !!this.config.recurrence && "true" === this.config.recurrence.toString().trim().toLowerCase();
                  t.addCssLink(e.host + "/css/button.css"),
                      this.btn = document.createElement("button"),
                      this.btn.setAttribute("type", "submit"),
                      this.config.buttonsize = this.config.buttonsize ? this.config.buttonsize.trim().toLowerCase() : "default",
                      this.config.buttoncolor = this.config.buttoncolor ? this.config.buttoncolor.trim().toLowerCase() : "navy",
                      e.validate.inValues(this.config.buttonsize, "small", "medium", "large") || (this.config.buttonsize = "default"),
                      e.validate.inValues(this.config.buttoncolor, "navy", "gray") || (this.config.buttoncolor = "navy"), this.btn.className = "start-js-btn modal-opener " + (this.config.buttonsize ? this.config.buttonsize : "default"), this.btn.style = "true" === this.config.custom ? "display:none;" : "", n += e.isSpanish ? "ES/" : "EN/", n += this.config.buttoncolor, n += "/" + this.config.buttonsize + (i ? "/SubscribeWith.png" : "/PayWith.png"), this.btn.style.background = 'url("' + n + '")', t.bind(this.btn, "click", this.open), this.form.appendChild(this.btn)
              }, i.prototype.open = function(t) {
                  return t.preventDefault ? t.preventDefault() : t.returnValue = !1, n ? alert("Due to security reasons please, use modern browser (IE11, FireFox, Chrome or Safari) to make payment!") : (navigator.userAgent.match(/iPhone|iPad|iPod/i) && (window.scrollTo(0, 0), document.body.className += "visanet-opened"), e.open(this.params)), !1
              }, i.prototype.complete = function(e) {
                  this.form.appendChild(t.addInput("transactionToken", e.token)), this.form.appendChild(t.addInput("customerEmail", e.email)), this.form.appendChild(t.addInput("channel", e.channel)), this.form.submit()
              }, i.prototype.cancel = function() {}, i
          }()
      }
  }.call(this),
  function() {
      this.VisanetCheckout.open || (this.VisanetCheckout.open = this.VisanetCheckout.Checkout.open, this.VisanetCheckout.configure = this.VisanetCheckout.Checkout.config)
  }.call(this),
  function() {
      if (!this.VisanetCheckout.auto) {
          this.VisanetCheckout.auto = !0;
          var t = this.VisanetCheckout.scriptTag,
              e = t.parentElement,
              n = {};
          if ("FORM" == e.tagName) {
              var o, r;
              for (i = 0; i < t.attributes.length; i++) null !== (r = (o = t.attributes[i]).name.match(/^data-(.+)$/)) && (paramName = a(r[1]), n[paramName] = o.value);
              var s = e.getAttribute("action");
              if (n.action = s, null != n) {
                  n.tabOnMobile = !1;
                  new this.VisanetCheckout.Button(e, n)
              }
          }
      }

      function a(t) {
          return t.replace(/(?:[-_])(\w)/g, function(t, e) {
              return e.toUpperCase()
          })
      }
  }.call(this);
document.addEventListener('DOMContentLoaded', () => {

  (function () {
    var throttle = function (type, name, obj) {
      obj = obj || window;
      var running = false;
      var func = function () {
        if (running) {
          return;
        }
        running = true;
        requestAnimationFrame(function () {
          obj.dispatchEvent(new CustomEvent(name));
          running = false;
        });
      };
      obj.addEventListener(type, func);
    };

    /* init - you can init any event */
    throttle("resize", "optimizedResize");
  })();

  const arr = []

// handle event
  window.addEventListener("optimizedResize", function () {
    arr.forEach(fn => {
      fn()
    })
  })


  // class Slider {
  //   constructor(settings) {
  //     this.window = document.querySelector(settings.windowSelector)
  //     this.field = document.querySelector(settings.fieldSelector)
  //     this.cards = document.querySelectorAll(settings.cardSelector)
  //     this.arrowPrev = document.querySelector(settings.buttonPrevSelector)
  //     this.arrowNext = document.querySelector(settings.buttonNextSelector)
  //     this.progress = document.querySelector(settings.progressSelector)
  //     this.dotsWrap = document.querySelector(settings.dotsWrapSelector)
  //   }
  //
  //   resize() {
  //
  //   }
  //
  // }

  //slider
  function slider(settings) {
    const window_ = document.querySelector(settings.windowSelector),
      field_ = document.querySelector(settings.fieldSelector),
      cards_ = document.querySelectorAll(settings.cardSelector),
      arrowPrev_ = document.querySelector(settings.buttonPrevSelector),
      arrowNext_ = document.querySelector(settings.buttonNextSelector),
      progress_ = document.querySelector(settings.progressSelector),
      dotsWrap_ = document.querySelector(settings.dotsWrapSelector),
      progressNumCurrent = document.querySelector(settings.progressNumCurrentSelector),
      progressNumAll = document.querySelector(settings.progressNumAllSelector);

    let startPoint,
      swipeAction,
      endPoint,
      sliderCounter = 0,
      dots_ = [],
      mouseMoveFlag = false,
      moveLastCardFlag = false,
      observerTicker;

    if (window_) {

      if(settings.infinite) {

        const options = {
          root: window_,
          rootMargin: '0px',
          threshold: 0
        }

        let callback

        function startObserve(right = false) {

          if (right) {
            callback = function(entries, observer) {
              entries.forEach(entry => {
                // entry.time                   // a DOMHightResTimeStamp indicating when the intersection occurred.
                // entry.rootBounds             // a DOMRectReadOnly for the intersection observer's root.
                // entry.boundingClientRect     // a DOMRectReadOnly for the intersection observer's target.
                // entry.intersectionRect       // a DOMRectReadOnly for the visible portion of the intersection observer's target.
                // entry.intersectionRatio      // the number for the ratio of the intersectionRect to the boundingClientRect.
                // entry.target                 // the Element whose intersection with the intersection root changed.
                // entry.isIntersecting         // intersecting: true or false

                if (!entry.isIntersecting && entry.boundingClientRect.left > 0) {
                  const width = entry.target.clientWidth
                  // transformValue -=width
                  entry.target.remove()
                  field_.style.transform = `translateX(-${((cards_[0].scrollWidth + betweenCards) * sliderCounter) - width}px)`;
                  // field.style.transform = `translateX(${transformValue}px)`
                  field_.prepend(entry.target)
                }
              });
            };
          } else {
            callback = function(entries, observer) {
              entries.forEach((entry, index) => {
                console.log(entry.isIntersecting)
                if (!entry.isIntersecting && entry.boundingClientRect.left < 0) {
                  const width = entry.target.clientWidth
                  // transformValue +=width
                  entry.target.remove()
                  // field_.style.transform = `translateX(-${((cards_[0].scrollWidth + betweenCards) * sliderCounter)}px)`;
                  // field.style.transform = `translateX(${transformValue}px)`
                  field_.append(entry.target)
                }
              });
            };
          }

          observerTicker = new IntersectionObserver(callback, options)
          cards_.forEach(el => {
            observerTicker.observe(el)
          })
        }

      }

      if(settings.infinite) startObserve()

      function clear() {
        startPoint = null
        swipeAction = null
        endPoint = null
        sliderCounter = 0
        mouseMoveFlag = false
        moveLastCardFlag = false
        field_.style.transform = ''
        if (dotsWrap_) {
          dots_.forEach((item, index)=> {
            item.classList.remove(settings.dotActiveClass);
          });
          dots_[0].classList.add(settings.dotActiveClass);
        }
        if (arrowNext_) arrowNext_.classList.remove(settings.buttonActiveClass);
        if (arrowPrev_) arrowPrev_.classList.add(settings.buttonActiveClass);
      }

      function disable() {
        if (document.documentElement.clientWidth > 991) {
          clear()
        }
      }

      arr.push(disable)

      // считаем расстояние между карточками
      // общая длина всех карточек + расстояния между ними
      const lengthCardAndBetweenCards = cards_[cards_.length - 1].getBoundingClientRect().right - cards_[0].getBoundingClientRect().left;
      // расстояние между карточками
      const betweenCards = (lengthCardAndBetweenCards - (cards_[0].clientWidth * cards_.length)) / (cards_.length -1);

      // считаем количество карточек, помещающихся в окне
      function numberIntegerVisibleCards() {
        return Math.floor((window_.clientWidth + betweenCards) / (cards_[0].clientWidth + betweenCards))
      }
      // считаем на какая часть карточки не помещается
      function partCard() {
        return (window_.clientWidth + betweenCards) / (cards_[0].clientWidth + betweenCards) - Math.trunc((window_.clientWidth + betweenCards) / (cards_[0].clientWidth + betweenCards))
      }
      // проверяем, показывается ли последняя карточка
      function lastCard() {
        if ( (sliderCounter + numberIntegerVisibleCards()) >= (cards_.length) && cards_.length > numberIntegerVisibleCards()) {
          sliderCounter = cards_.length - numberIntegerVisibleCards() - 1
          return true
        }
        return false
      }

      // проверяем, больше ли у нас карточек, чем может поместиться в видимой части слайдера
      function checkNumCards() {
        if (cards_.length > numberIntegerVisibleCards()) {
          return true
        }
        field_.style.transform = '';
        return false
      }

      //Общее количество слайдов
      if (progressNumAll) progressNumAll.textContent = cards_.length

      //Устанавливаем ширину бегунка прогресс-бара
      if (progress_) {
        progress_.style.width = 100 / cards_.length + '%'
      }

      // Слайд следующий

      function slideNext(dots = false) {
        if (!checkNumCards()) {
          return
        }
        // if(observerTicker) observerTicker.disconnect()
        if(!dots) sliderCounter++;
        if (arrowNext_) arrowNext_.classList.remove(settings.buttonActiveClass);
        if (arrowPrev_) arrowPrev_.classList.remove(settings.buttonActiveClass);
        if (sliderCounter >= cards_.length) {
          sliderCounter = cards_.length - 1;
        }
        if(progressNumCurrent) progressNumCurrent.textContent =  sliderCounter + 1
        if ((sliderCounter + 1) === cards_.length) {
          arrowNext_.classList.add(settings.buttonActiveClass);
        }
        if (progress_) progress_.style.left = (100 / cards_.length) * sliderCounter + '%'
        if (dotsWrap_) dots_.forEach(item => item.classList.remove(settings.dotActiveClass))
        if (lastCard() && !settings.infinite) {
          field_.style.transform = `translateX(-${field_.scrollWidth - window_.clientWidth}px)`
          sliderCounter = Math.ceil(cards_.length - numberIntegerVisibleCards() - partCard())
          if (dotsWrap_) dots_[dots_.length - 1].classList.add(settings.dotActiveClass)
          return
        }
        if (dotsWrap_) dots_[sliderCounter].classList.add(settings.dotActiveClass)
        field_.style.transform = `translateX(-${(cards_[0].scrollWidth + betweenCards) * sliderCounter}px)`;
      }

      // Слайд предыдущий

      function slidePrev(dots = false) {
        if (!checkNumCards()) {
          return
        }
        if(observerTicker) observerTicker.disconnect()
        sliderCounter = Math.floor(sliderCounter)
        if(!dots) sliderCounter--;
        if (arrowNext_) arrowNext_.classList.remove(settings.buttonActiveClass);
        if (arrowPrev_) arrowPrev_.classList.remove(settings.buttonActiveClass);
        if (sliderCounter <= 0) {
          sliderCounter = 0;
        }
        if(progressNumCurrent) progressNumCurrent.textContent =  sliderCounter + 1
        if (sliderCounter === 0 && arrowPrev_) {
          arrowPrev_.classList.add(settings.buttonActiveClass);
        }
        if (dotsWrap_) {
          dots_.forEach((item, index)=> {
            item.classList.remove(settings.dotActiveClass);
          });
          dots_[sliderCounter].classList.add(settings.dotActiveClass);
        }

        if (progress_) {
          progress_.style.left = (100 / cards_.length) * sliderCounter + '%'
        }
        if(settings.infinite) startObserve(true)
        field_.style.transform = `translateX(-${(cards_[0].scrollWidth + betweenCards) * sliderCounter}px)`;
      }

      // Рендер точек

      if (dotsWrap_) {

        cards_.forEach(() => {
          const dot = document.createElement('div');
          dot.classList.add(settings.dotClass);
          dotsWrap_.appendChild(dot);
          dots_.push(dot);
        });
        dots_[0].classList.add(settings.dotActiveClass);
        dots_.forEach((item, index) => {
          item.addEventListener('click', () => {
            if (!checkNumCards()) {
              return
            }
            if (index > sliderCounter) {
              sliderCounter = index;
              slideNext(true)
              return
            }
            if (index < sliderCounter) {
              sliderCounter = index;
              slidePrev(true)
            }
          });
        });
      }

      // Переключение на стрелки
      if (arrowPrev_) {
        arrowPrev_.addEventListener('click', () => {
          slidePrev();
        });
      }

      if (arrowNext_) {
        arrowNext_.addEventListener('click', () => {
          slideNext();
        });
      }

      //Автоматическое переключение
      if(settings.auto) {
        const auto = setInterval(slideNext, 4000)
      }

      // Свайп слайдов тач-событиями

      window_.addEventListener('touchstart', (e) => {
        if(settings.disabledPoint && document.documentElement.clientWidth > settings.disabledPoint) {
          return
        }
        startPoint = e.changedTouches[0].pageX;
        if (lastCard() && numberIntegerVisibleCards() < cards_.length) moveLastCardFlag = true
      });

      window_.addEventListener('touchmove', (e) => {
        if(settings.disabledPoint && document.documentElement.clientWidth > settings.disabledPoint) {
          return
        }
        swipeAction = e.changedTouches[0].pageX - startPoint;
        if (moveLastCardFlag) {
          field_.style.transform = `translateX(${swipeAction + -(field_.clientWidth - window_.clientWidth)}px)`;
        } else {
          field_.style.transform = `translateX(${swipeAction + (-(cards_[0].scrollWidth + betweenCards) * sliderCounter)}px)`;

        }
      });

      window_.addEventListener('touchend', (e) => {
        if(settings.disabledPoint && document.documentElement.clientWidth > settings.disabledPoint) {
          return
        }
        moveLastCardFlag = false
        endPoint = e.changedTouches[0].pageX;
        if (Math.abs(startPoint - endPoint) > 50 && checkNumCards()) {
          if (arrowNext_) arrowNext_.classList.remove(settings.buttonActiveClass);
          if (arrowPrev_) arrowPrev_.classList.remove(settings.buttonActiveClass);
          if (endPoint < startPoint) {
            slideNext();
          } else {
            slidePrev();
          }
        } else {
          field_.style.transform = `translateX(-${(cards_[0].scrollWidth + betweenCards) * sliderCounter}px)`;
        }
      });

      // Свайп слайдов маус-событиями
      window_.addEventListener('mousedown', (e) => {
        if(settings.disabledPoint && document.documentElement.clientWidth > settings.disabledPoint) {
          return
        }
        e.preventDefault();
        startPoint = e.pageX;
        mouseMoveFlag = true;
        if (lastCard()) moveLastCardFlag = true
      });
      window_.addEventListener('mousemove', (e) => {
        if(settings.disabledPoint && document.documentElement.clientWidth > settings.disabledPoint) {
          return
        }
        if (mouseMoveFlag) {
          e.preventDefault();
          swipeAction = e.pageX - startPoint;
          if (moveLastCardFlag) {
            field_.style.transform = `translateX(${swipeAction + -(field_.clientWidth - document.documentElement.clientWidth)}px)`;
          } else {
            field_.style.transform = `translateX(${swipeAction + (-(cards_[0].scrollWidth + betweenCards) * sliderCounter)}px)`;
          }
        }
      });
      window_.addEventListener('mouseup', (e) => {
        if(settings.disabledPoint && document.documentElement.clientWidth > settings.disabledPoint) {
          return
        }
        moveLastCardFlag = false
        mouseMoveFlag = false
        endPoint = e.pageX;
        if (Math.abs(startPoint - endPoint) > 50 && checkNumCards()) {
          if (arrowNext_) arrowNext_.classList.remove(settings.buttonActiveClass);
          if (arrowPrev_) arrowPrev_.classList.remove(settings.buttonActiveClass);
          if (endPoint < startPoint) {
            slideNext();
          } else {
            slidePrev();
          }
        } else if(Math.abs(startPoint - endPoint) === 0) {
          return
        }
        else {
          field_.style.transform = `translateX(-${(cards_[0].scrollWidth + betweenCards) * sliderCounter}px)`;
        }
      })
      window_.addEventListener('mouseleave', () => {
        if(settings.disabledPoint && document.documentElement.clientWidth > settings.disabledPoint) {
          return
        }
        if (mouseMoveFlag) {
          field_.style.transform = `translateX(-${(cards_[0].scrollWidth + betweenCards) * sliderCounter}px)`;
        }
        mouseMoveFlag = false
        moveLastCardFlag = false
      })
    }
  }


  slider({
    windowSelector: '.steps__window',
    fieldSelector: '.steps__field',
    cardSelector: '.steps__box',
    buttonPrevSelector: '.steps__interface .interface__arrow--prev',
    buttonNextSelector: '.steps__interface .interface__arrow--next',
    buttonActiveClass: 'interface__arrow--inactive',
    disabledPoint: 991,
    dotsWrapSelector: '.steps__interface .interface__dots',
    dotClass: 'interface__dot',
    dotActiveClass: 'interface__dot--active'
  });

  slider({
    windowSelector: '.party__window',
    fieldSelector: '.party__field',
    cardSelector: '.party__card',
    buttonPrevSelector: '.party__interface .interface__arrow--prev',
    buttonNextSelector: '.party__interface .interface__arrow--next',
    buttonActiveClass: 'interface__arrow--inactive',
    progressNumCurrentSelector: '.party__interface .interface__text__span--1',
    progressNumAllSelector: '.party__interface .interface__text__span--3',
    auto: true,
    infinite: true
    // disabledPoint: 991,
    // dotsWrapSelector: '.steps__interface .interface__dots',
    // dotClass: 'interface__dot',
    // dotActiveClass: 'interface__dot--active'
  });

  // ticker
  function ticker({windowSelector, fieldSelector, cardSelector, speed, right, breakpoint}) {
    const _window = document.querySelector(windowSelector)
    const field = document.querySelector(fieldSelector)

    if (_window) {
      const tickerCards = field.querySelectorAll(cardSelector)
      let transformValue = 0


      const options = {
        root: _window,
        rootMargin: '0px',
        threshold: 0
      }

      let callback

      if (right) {
        callback = function(entries, observer) {
          entries.forEach(entry => {
            // entry.time                   // a DOMHightResTimeStamp indicating when the intersection occurred.
            // entry.rootBounds             // a DOMRectReadOnly for the intersection observer's root.
            // entry.boundingClientRect     // a DOMRectReadOnly for the intersection observer's target.
            // entry.intersectionRect       // a DOMRectReadOnly for the visible portion of the intersection observer's target.
            // entry.intersectionRatio      // the number for the ratio of the intersectionRect to the boundingClientRect.
            // entry.target                 // the Element whose intersection with the intersection root changed.
            // entry.isIntersecting         // intersecting: true or false

            if (!entry.isIntersecting && entry.boundingClientRect.left > 0) {
              const width = entry.target.clientWidth
              transformValue -=width
              entry.target.remove()
              field.style.transform = `translateX(${transformValue}px)`
              field.prepend(entry.target)
            }
          });
        };
      } else {
        callback = function(entries, observer) {
          entries.forEach(entry => {
            if (!entry.isIntersecting && entry.boundingClientRect.left < 0) {
              const width = entry.target.clientWidth
              transformValue +=width
              entry.target.remove()
              field.style.transform = `translateX(${transformValue}px)`
              field.append(entry.target)
            }
          });
        };
      }

      const observerTicker = new IntersectionObserver(callback, options)
      tickerCards.forEach(el => {
        observerTicker.observe(el)
      })

      const run = () => {
        if (!breakpoint || document.documentElement.clientWidth < breakpoint) {
          right ? transformValue += speed : transformValue -= speed
          field.style.transform = 'translateX('  + transformValue  + 'px)'
        } else {
          field.style.transform = ''
        }
        window.requestAnimationFrame(run)
      }

      window.requestAnimationFrame(run)
    }
  }

  ticker({
    windowSelector: '.running__window--1',
    fieldSelector: '.running__field--1',
    cardSelector: '.running__card--1',
    speed: 0.5
  })

  ticker({
    windowSelector: '.running__window--2',
    fieldSelector: '.running__field--2',
    cardSelector: '.running__card--2',
    speed: 0.5
  })

})
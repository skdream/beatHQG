//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.gameOver = false;
        /**骨骼动画实例移动的步长值**/
        this.entityFlagNumX = 0;
        /**Touch事件是否发展为移动事件**/
        this.moveFlag = true;
        this.chgFlag1 = true;
        this.chgFlag2 = true;
        this.chgFlag3 = true;
        this.tapCounter = 0;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var __egretProto__ = Main.prototype;
    __egretProto__.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        egret.StageDelegate.getInstance().setDesignSize(560, 560);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/resource.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    __egretProto__.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    __egretProto__.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    __egretProto__.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    __egretProto__.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     * Create a game scene
     */
    __egretProto__.createGameScene = function () {
        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouch, this);
        //        var sky:egret.Bitmap = this.createBitmapByName("bgImage");
        //        this.addChild(sky);
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        //        sky.width = stageW;
        //        sky.height = stageH;
        this.stage_bg = this.createBitmapByName('stageBg');
        this.stage_bg.width = stageW;
        this.stage_bg.height = stageH;
        this.addChild(this.stage_bg);
        //        var topMask:egret.Shape = new egret.Shape();
        //        topMask.graphics.beginFill(0x000000, 0.5);
        //        topMask.graphics.drawRect(0, 0, stageW, stageH);
        //        topMask.graphics.endFill();
        //        topMask.width = stageW;
        //        topMask.height = stageH;
        //        this.addChild(topMask);
        var hqg_data = RES.getRes("hua_json");
        var hqg_texture = RES.getRes("hua");
        var mcDataFactory = new egret.MovieClipDataFactory(hqg_data, hqg_texture);
        this.hua_eye = new egret.MovieClip(mcDataFactory.generateMovieClipData("hua-eye"));
        this.hua_nose = new egret.MovieClip(mcDataFactory.generateMovieClipData("hua-nose"));
        this.hua_mouth = new egret.MovieClip(mcDataFactory.generateMovieClipData("hua-mouth"));
        this.hua_normal = new egret.MovieClip(mcDataFactory.generateMovieClipData("hua-normal"));
        //this.hua_eye.width = this.hua_normal.width = 310;
        this.sprcon = new egret.Sprite();
        this.addChild(this.sprcon);
        this.sprcon.x = 30;
        this.sprcon.y = 210;
        this.sprcon.addChild(this.hua_normal);
        // 血格
        var blood = this.createBitmapByName('blood');
        // 头像
        var avatar = this.createBitmapByName('avatar');
        avatar.y = 100;
        blood.y = 130;
        blood.x = (stageW - 160) / 2 - 80;
        blood.height = blood.height - 10;
        avatar.x = (stageW - 160) / 2 - 100;
        avatar.width = 60;
        avatar.height = 71.85185185185185;
        blood.width = stageW - 160;
        this.addChild(blood);
        this.addChild(avatar);
        // this.huaqiangu.gotoAndPlay(0,-1);
        var data = RES.getRes("panda_json");
        var texture = RES.getRes("panda");
        var mcDataFactory = new egret.MovieClipDataFactory(data, texture);
        this.panda = new egret.MovieClip(mcDataFactory.generateMovieClipData("panda"));
        this.panda.x = 70;
        this.panda.y = 310;
        this.addChild(this.panda);
        //  this.panda.gotoAndPlay(0,-1);
        var tx = new egret.TextField;
        tx.width = this.stage.stageWidth - 20;
        tx.textFlow = (new egret.HtmlTextParser).parser(RES.getRes('panda_json'));
        tx.textFlow = [
            { text: "嘤嘤嘤，子画我被人欺负了", style: { "textColor": 0x000000, "size": 26, "fontFamily": "微软雅黑" } },
            { text: " \n" },
            { text: "快使用还我漂漂拳恢复我的美貌~", style: { "textColor": 0x000000, "size": 26, "fontFamily": "微软雅黑" } }
        ];
        tx.x = 10;
        tx.y = 30;
        tx.textAlign = egret.HorizontalAlign.CENTER;
        var timeTxt = new egret.TextField;
        timeTxt.textFlow = [
            { text: "", style: { "textColor": 0x000000, "size": 30, stroke: 1, strokeColor: 0xffffff, italic: true } }
        ];
        timeTxt.x = 0;
        timeTxt.y = 120;
        timeTxt.textAlign = egret.HorizontalAlign.CENTER;
        this.hitTxt = new egret.TextField;
        this.hitTxt.textFlow = [
            { text: "0", style: { "textColor": 0x000000, "size": 34, stroke: 1, strokeColor: 0xffffff, italic: true, bold: true } },
            { text: "\n", style: { size: 12 } },
            { text: "HIT", style: { "textColor": 0x000000, "size": 12, stroke: 1, strokeColor: 0xffffff, italic: true, bold: true } }
        ];
        this.hitTxt.y = 120;
        this.hitTxt.x = stageW - 60;
        this.hitTxt.textAlign = egret.HorizontalAlign.CENTER;
        this.addChild(tx);
        this.addChild(timeTxt);
        this.addChild(this.hitTxt);
        this.sound = RES.getRes("pa_mp3");
        this.sound.type = egret.Sound.EFFECT;
        this.myTimer = new egret.Timer(10);
        this.myTimer.addEventListener(egret.TimerEvent.TIMER, this.onTimer, this);
        var self = this;
        this.countDown(20, function (leftTime) {
            if (leftTime >= 0) {
                var time = leftTime > 9 ? leftTime : '0' + leftTime;
                var textFlow = [
                    { text: time + 's', style: { "textColor": 0x000000, "size": 30, stroke: 1, strokeColor: 0xffffff, italic: true } }
                ];
                self.changeTxt(timeTxt, textFlow);
            }
            else {
                self.gameOver = true;
                // self.removeEventListener(egret.TouchEvent.TOUCH_BEGIN,self.onTouch,self)
                alert('boom');
            }
        });
    };
    __egretProto__.reduceBlood = function () {
        var down = this.createBitmapByName('down');
        down.x = 200;
        down.y = 300;
        this.stage.addChild(down);
        var self = this;
        var tw = egret.Tween.get(down);
        tw.to({ y: 0 }, 500).call(function () {
            tw.to({ opacity: 0 });
            self.stage.removeChild(down);
        });
    };
    __egretProto__.countDown = function (time, callback) {
        var timer = null;
        var self = this;
        function decrease() {
            time--;
            if (time < 0) {
                clearTimeout(timer);
                if (self.stage.hasEventListener(egret.TouchEvent.TOUCH_BEGIN)) {
                    self.stage.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouch, this);
                }
                callback(time);
                return false;
            }
            timer = setTimeout(function () {
                decrease();
            }, 1000);
            callback(time);
        }
        decrease();
    };
    __egretProto__.onTouch = function (evt) {
        evt.stopPropagation();
        console.log("button touched");
        this.entityFlagNumX++;
        this.tapCounter++;
        var hits = [
            { text: this.tapCounter + '', style: { "textColor": 0x000000, "size": 34, stroke: 1, strokeColor: 0xffffff, italic: true, bold: true } },
            { text: "\n", style: { size: 12 } },
            { text: "HIT", style: { "textColor": 0x000000, "size": 12, stroke: 1, strokeColor: 0xffffff, italic: true, bold: true } }
        ];
        if (!this.gameOver) {
            this.sound.play();
            this.panda.gotoAndPlay(1);
            this.changeTxt(this.hitTxt, hits);
            this.reduceBlood();
            if (this.chgFlag1) {
                this.sprcon.removeChildren();
                this.sprcon.addChild(this.hua_eye);
                this.chgFlag1 = false;
            }
            if (this.entityFlagNumX < 40) {
                this.hua_eye.gotoAndPlay(1);
            }
            else if (this.entityFlagNumX >= 40 && this.entityFlagNumX < 80) {
                if (this.chgFlag2) {
                    this.sprcon.removeChildren();
                    this.sprcon.addChild(this.hua_nose);
                    this.chgFlag2 = false;
                }
                this.hua_nose.gotoAndPlay(1);
            }
            else if (this.entityFlagNumX >= 80) {
                if (this.chgFlag3) {
                    this.sprcon.removeChildren();
                    this.sprcon.addChild(this.hua_mouth);
                    this.chgFlag3 = false;
                }
                this.hua_mouth.gotoAndPlay(1);
            }
        }
    };
    __egretProto__.onTimer = function (evt) {
        console.log(evt + ':timer');
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    __egretProto__.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    __egretProto__.startAnimation = function (result) {
        var self = this;
        var parser = new egret.HtmlTextParser();
        var textflowArr = [];
        for (var i = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }
        var textfield = self.textfield;
        var count = -1;
        var change = function () {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            var lineArr = textflowArr[count];
            self.changeDescription(textfield, lineArr);
            var tw = egret.Tween.get(textfield);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, self);
        };
        change();
    };
    /**
     * 切换描述内容
     * Switch to described content
     */
    __egretProto__.changeDescription = function (textfield, textFlow) {
        textfield.textFlow = textFlow;
    };
    /**
     * 切换定时器显示时间
     *
     */
    __egretProto__.changeTxt = function (textfield, textFlow) {
        textfield.textFlow = textFlow;
    };
    return Main;
})(egret.DisplayObjectContainer);
Main.prototype.__class__ = "Main";

 package com.hiepnvna.tlivevoice

import android.app.Activity
import android.view.WindowManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class ScreenManagerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "ScreenManager"

    @ReactMethod
    fun keepScreenOn(promise: Promise) {
        try {
            val activity = currentActivity
            if (activity != null) {
                activity.runOnUiThread {
                    activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                }
                promise.resolve(null)
            } else {
                promise.reject("ERROR", "Activity is null")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun allowScreenOff(promise: Promise) {
        try {
            val activity = currentActivity
            if (activity != null) {
                activity.runOnUiThread {
                    activity.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                }
                promise.resolve(null)
            } else {
                promise.reject("ERROR", "Activity is null")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
} 
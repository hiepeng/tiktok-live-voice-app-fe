package com.hiepnvna.tlivevoice

import android.app.*
import android.content.Intent
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import android.content.Context
import android.os.Build
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.ContextWrapper
import android.content.IntentFilter

class BackgroundService : Service() {
    private var wakeLock: PowerManager.WakeLock? = null
    private val CHANNEL_ID = "TikTokLiveVoiceChannel"
    private val NOTIFICATION_ID = 1
    private var isServiceRunning = false

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        acquireWakeLock()
        registerScreenStateReceiver()
        isServiceRunning = true
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (!isServiceRunning) {
            val notification = createNotification()
            startForeground(NOTIFICATION_ID, notification)
            isServiceRunning = true
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        releaseWakeLock()
        unregisterScreenStateReceiver()
        isServiceRunning = false
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "TikTok Live Voice Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps TikTok Live Voice running in background"
                setShowBadge(false)
            }
            
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val pendingIntent = Intent(this, MainActivity::class.java).let { notificationIntent ->
            PendingIntent.getActivity(
                this, 0, notificationIntent,
                PendingIntent.FLAG_IMMUTABLE
            )
        }

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("TikTok Live Voice")
            .setContentText("Running in background")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()
    }

    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "TikTokLiveVoice::WakeLock"
        ).apply {
            setReferenceCounted(false)
            acquire(10*60*1000L /*10 minutes*/)
        }
    }

    private fun releaseWakeLock() {
        wakeLock?.let {
            if (it.isHeld) {
                it.release()
            }
        }
        wakeLock = null
    }

    private fun registerScreenStateReceiver() {
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_OFF)
            addAction(Intent.ACTION_SCREEN_ON)
        }
        registerReceiver(screenStateReceiver, filter)
    }

    private fun unregisterScreenStateReceiver() {
        try {
            unregisterReceiver(screenStateReceiver)
        } catch (e: Exception) {
            // Ignore if receiver is not registered
        }
    }

    private val screenStateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                Intent.ACTION_SCREEN_OFF -> {
                    // Screen is turned off, ensure service keeps running
                    if (!isServiceRunning) {
                        val serviceIntent = Intent(context, BackgroundService::class.java)
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            context?.startForegroundService(serviceIntent)
                        } else {
                            context?.startService(serviceIntent)
                        }
                    }
                }
                Intent.ACTION_SCREEN_ON -> {
                    // Screen is turned on, update notification if needed
                    if (isServiceRunning) {
                        val notification = createNotification()
                        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                        notificationManager.notify(NOTIFICATION_ID, notification)
                    }
                }
            }
        }
    }
} 
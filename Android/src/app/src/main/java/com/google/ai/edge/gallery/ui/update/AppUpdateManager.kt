package com.google.ai.edge.gallery.ui.update

import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.content.FileProvider
import java.io.File
import java.net.HttpURLConnection
import java.net.URL

data class UpdateInfo(
  val versionCode: Int,
  val versionName: String,
  val apkUrl: String,
  val releaseNotes: String,
)

class AppUpdateManager(private val context: Context) {
  private val tag = "AGAppUpdate"
  private val updateUrl = "https://striketips.pages.dev/latest_version.json"

  suspend fun check(): UpdateInfo? {
    return try {
      val json = URL(updateUrl).readText()
      val lines = json.lines().map { it.trim() }
      fun field(name: String): String? {
        val prefix = "\"$name\":"
        return lines.firstOrNull { it.startsWith(prefix) }?.substringAfter(":")?.trim {
          it == '"' || it == ' ' || it == ','
        }
      }
      val versionCode = field("versionCode")?.toIntOrNull() ?: return null
      val versionName = field("versionName") ?: return null
      val apkUrl = field("apkUrl") ?: return null
      val releaseNotes = field("releaseNotes") ?: ""
      UpdateInfo(versionCode, versionName, apkUrl, releaseNotes)
    } catch (e: Exception) {
      Log.w(tag, "Failed to check for updates", e)
      null
    }
  }

  suspend fun downloadApk(apkUrl: String, onProgress: (Float) -> Unit): File {
    val destDir = File(context.filesDir, "updates").apply { mkdirs() }
    val apkFile = File(destDir, "strike-tips-update.apk")
    if (apkFile.exists()) apkFile.delete()

    kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
      val url = URL(apkUrl)
      val conn = url.openConnection() as HttpURLConnection
      conn.connectTimeout = 15000
      conn.readTimeout = 30000
      conn.connect()

      val totalBytes = conn.contentLengthLong
      val input = conn.inputStream
      val output = apkFile.outputStream()
      val buffer = ByteArray(8192)
      var downloaded = 0L

      input.use { inp ->
        output.use { out ->
          var read: Int
          while (inp.read(buffer).also { read = it } != -1) {
            out.write(buffer, 0, read)
            downloaded += read
            if (totalBytes > 0) {
              onProgress(downloaded.toFloat() / totalBytes)
            }
          }
        }
      }
    }
    return apkFile
  }

  fun installApk(apkFile: File) {
    val uri = FileProvider.getUriForFile(
      context, "${context.packageName}.provider", apkFile
    )
    val intent = Intent(Intent.ACTION_VIEW).apply {
      setDataAndType(uri, "application/vnd.android.package-archive")
      addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    context.startActivity(intent)
  }
}

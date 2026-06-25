package com.google.ai.edge.gallery.ui.update

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun UpdateDialog(
  updateInfo: UpdateInfo,
  isDownloading: Boolean,
  progress: Float,
  onUpdate: () -> Unit,
  onDismiss: () -> Unit,
) {
  AlertDialog(
    onDismissRequest = { if (!isDownloading) onDismiss() },
    title = { Text("Update Available") },
    text = {
      Column(modifier = Modifier.fillMaxWidth()) {
        Text("Strike Tips ${updateInfo.versionName} is available.")
        Spacer(modifier = Modifier.height(8.dp))
        Text(
          "Release Notes:",
          style = MaterialTheme.typography.labelMedium,
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
          updateInfo.releaseNotes,
          style = MaterialTheme.typography.bodySmall,
          modifier = Modifier.verticalScroll(rememberScrollState()).height(120.dp),
        )
        if (isDownloading) {
          Spacer(modifier = Modifier.height(12.dp))
          LinearProgressIndicator(
            progress = { progress },
            modifier = Modifier.fillMaxWidth(),
          )
          Spacer(modifier = Modifier.height(4.dp))
          Text(
            "${(progress * 100).toInt()}%",
            style = MaterialTheme.typography.labelSmall,
          )
        }
      }
    },
    confirmButton = {
      Button(
        onClick = onUpdate,
        enabled = !isDownloading,
      ) {
        if (isDownloading) {
          Row {
            CircularProgressIndicator(
              modifier = Modifier.width(16.dp).height(16.dp),
              strokeWidth = 2.dp,
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("Downloading...")
          }
        } else {
          Text("Update")
        }
      }
    },
    dismissButton = {
      OutlinedButton(
        onClick = onDismiss,
        enabled = !isDownloading,
      ) {
        Text("Later")
      }
    },
  )
}

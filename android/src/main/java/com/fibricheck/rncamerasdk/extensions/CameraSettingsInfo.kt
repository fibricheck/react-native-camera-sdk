package com.fibricheck.rncamerasdk.extensions

import com.qompium.fibricheck.camerasdk.models.CameraSettingsInfo
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

fun CameraSettingsInfo.toWritableMap(): WritableMap {
  val event: WritableMap = Arguments.createMap()

  event.putArray("isoRange", Arguments.fromList(listOf(isoRange.first, isoRange.second)))
  event.putArray(
    "exposureTimeRange",
    Arguments.fromList(listOf(exposureTimeRange.first, exposureTimeRange.second))
  )
  event.putArray(
    "focusRange",
    Arguments.fromList(listOf(focusRange.first, focusRange.second))
  )
  event.putInt("hardwareLevel", this.hardwareLevel)
  event.putBoolean("hasManualPostProcessing", this.hasManualPostProcessing)

  return event
}
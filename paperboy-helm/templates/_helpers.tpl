{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "paperboy.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "paperboy.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "paperboy.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Push service name
*/}}
{{- define "paperboy.pushService.name" -}}
{{- printf "%s-push-service" (include "paperboy.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Preview push service name
*/}}
{{- define "paperboy.previewPushService.name" -}}
{{- printf "%s-preview-push-service" (include "paperboy.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
NATS queue url
*/}}
{{- define "paperboy.queue.url" -}}
{{- if .Values.nats.url -}}
{{- .Values.nats.url -}}
{{- else -}}
{{- printf "nats://%s-queue:4222" (include "paperboy.name" .) -}}
{{- end -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "paperboy.labels" -}}
helm.sh/chart: {{ include "paperboy.chart" . }}
{{ include "paperboy.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "paperboy.selectorLabels" -}}
app.kubernetes.io/name: {{ include "paperboy.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "paperboy.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
    {{ default (include "paperboy.fullname" .) .Values.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.serviceAccount.name }}
{{- end -}}
{{- end -}}

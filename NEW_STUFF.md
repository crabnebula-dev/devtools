# Hackathon new stuff

1. Logs have attributes + span links.
1. Spans now have an error status.
1. Added target and attributes to span details.
1. Reworked "known trace" detection.
1. Tree structure traces (sort, indent, color).
1. Basic level filter for trace details.
1. Associated logs in trace details.
1. Roughly prevent log duplication.
1. Jump to source from logs.
1. Error and text filter spans.
1. Parse plugin commands from
   `command: plugin:your_plugin|some_cmd`
   to `plugin: your_plugin.some_cmd`.

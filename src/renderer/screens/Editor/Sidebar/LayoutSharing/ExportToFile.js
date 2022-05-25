import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { ipcRenderer } from "electron";
import jsonStringify from "json-stringify-pretty-compact";
import React from "react";
import { useTranslation } from "react-i18next";

export const ExportToFile = (props) => {
  const { t } = useTranslation();
  const exportToFile = () => {
    const { keymap, colormap } = props;
    const data = {
      keymaps: keymap.custom,
      colormaps: colormap.colorMap,
      palette: colormap.palette,
    };
    ipcRenderer.send("file-save", {
      content: jsonStringify(data),
      title: t("editor.sharing.selectExportFile"),
      defaultPath: "Layout.json",
      filters: [
        {
          name: t("editor.sharing.dialog.layoutFiles"),
          extensions: ["json", "layout"],
        },
        {
          name: t("editor.sharing.dialog.allFiles"),
          extensions: ["*"],
        },
      ],
    });
  };
  return (
    <Box sx={{ mb: 2 }}>
      <Button variant="outlined" onClick={exportToFile}>
        {t("editor.sharing.exportToFile")}
      </Button>
    </Box>
  );
};
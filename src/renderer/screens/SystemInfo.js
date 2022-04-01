// -*- mode: js-jsx -*-
/* Chrysalis -- Kaleidoscope Command Center
 * Copyright (C) 2020  Keyboardio, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from "react";

import Focus from "../../api/focus";
import Log from "../../api/log";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import MuiDialogTitle from "@mui/material/DialogTitle";
import Portal from "@mui/material/Portal";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { ipcRenderer, Electron } from "electron";

import { toast } from "react-toastify";

import logo from "../logo-small.png";
import { version } from "../../../package.json";

import si from "systeminformation";
import archiver from "archiver";
import fs from "fs";
import jsonStringify from "json-stringify-pretty-compact";
import { v4 as uuidv4 } from "uuid";

import i18n from "../i18n";

class SystemInfo extends React.Component {
  state = {
    collecting: false,
    collected: false,
    info: {},
    viewing: false,
  };

  closeViewBundle = () => {
    this.setState({
      viewing: false,
      collected: false,
      info: {},
    });
  };

  saveBundle = async () => {
    ipcRenderer.send("file-save", {
      content: jsonStringify(this.state.info),
      title: i18n.t("systeminfo.dialog.title"),
      defaultPath: "chrysalis-debug.bundle.json",
    });

    this.setState({
      collected: false,
      viewing: false,
      info: {},
    });
  };

  createBundle = async () => {
    await this.setState({ collecting: true });

    const logger = new Log();
    const focus = new Focus();

    let sysInfo = {
      timestamp: new Date(),
      uuid: uuidv4(),
      chrysalis: {
        version: version,
      },
      os: await si.osInfo(),
      logs: logger.messages(),
    };

    if (focus.device) {
      sysInfo.device = {
        info: focus.device.info,
        path: focus._port.path,
        commands: await focus.command("help"),
        keymap: await focus.command("keymap"),
        colormap: await focus.command("colormap"),
      };
    }

    await this.setState({
      collecting: false,
      collected: true,
      viewing: true,
      info: sysInfo,
    });
  };

  render() {
    const { classes } = this.props;
    const { collected, viewing } = this.state;

    let mainButton = (
      <Button
        disabled={this.state.collecting}
        color="primary"
        variant="outlined"
        onClick={async () => {
          return await this.createBundle();
        }}
      >
        {i18n.t("systeminfo.createBundle")}
      </Button>
    );

    const DialogTitle = (props) => {
      const { children, classes, ...other } = props;
      return (
        <MuiDialogTitle
          disableTypography
          sx={{
            margin: 0,
            padding: 2,
          }}
          {...other}
        >
          <Typography variant="h6">{children}</Typography>
          <Box
            sx={{
              position: "absolute",
              right: 1,
              top: 1,
            }}
          >
            <Button color="primary" onClick={this.saveBundle}>
              {i18n.t("systeminfo.saveBundle")}
            </Button>
            <IconButton onClick={this.closeViewBundle} size="large">
              <CloseIcon />
            </IconButton>
          </Box>
        </MuiDialogTitle>
      );
    };

    const viewDialog = (
      <Dialog
        open={viewing}
        scroll="paper"
        onClose={this.closeViewBundle}
        fullScreen
      >
        <DialogTitle>{i18n.t("systeminfo.title")}</DialogTitle>
        <DialogContent dividers>
          <TextField
            disabled
            multiline
            fullWidth
            value={jsonStringify(this.state.info)}
          />
        </DialogContent>
      </Dialog>
    );

    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Portal container={this.props.titleElement}>
          {i18n.t("systeminfo.title")}
        </Portal>
        <Card
          sx={{
            margin: 4,
            maxWidth: "50%",
          }}
        >
          <CardHeader
            avatar={<img src={logo} alt={i18n.t("components.logo.altText")} />}
            title="Chrysalis"
            subheader={version}
          />
          <CardContent>
            <Typography component="p" gutterBottom>
              {i18n.t("systeminfo.intro")}
            </Typography>

            <Typography component="p">
              {i18n.t("systeminfo.privacyNote")}
            </Typography>
            <Typography component="p">
              <Link href="https://github.com/keyboardio/Chrysalis/issues">
                {i18n.t("systeminfo.bugTracker")}
              </Link>
            </Typography>
          </CardContent>
          <CardActions>
            <Box sx={{ flexGrow: 1 }} />
            {mainButton}
          </CardActions>
        </Card>
        {viewDialog}
      </Box>
    );
  }
}

export default SystemInfo;

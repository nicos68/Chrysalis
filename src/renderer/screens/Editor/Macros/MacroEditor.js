// -*- mode: js-jsx -*-
/* Chrysalis -- Kaleidoscope Command Center
 * Copyright (C) 2020-2022  Keyboardio, Inc.
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

import React, { useEffect, useState } from "react";

import Focus from "@api/focus";
import { KeymapDB } from "@api/keymap";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";

import CloseIcon from "@mui/icons-material/Close";

import { PageTitle } from "@renderer/components/PageTitle";

import MacroStep from "./MacroStep";
import MacroStepAdd from "./MacroStepAdd";
import MacroStepEditor from "./MacroStepEditor";

const focus = new Focus();
const db = new KeymapDB();

const MacroEditor = (props) => {
  const { macroId, macro, onClose } = props;
  const [wipMacro, setWipMacro] = useState(null);
  const [stepEditorOpen, setStepEditorOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);

  const onStepDelete = (index) => {
    const m = wipMacro.map((v) => Object.assign({}, v));
    m.splice(index, 1);
    setWipMacro(m);
  };

  const onStepSelect = (index) => {
    if (index == selectedStep) {
      setSelectedStep(null);
      setStepEditorOpen(false);
    } else {
      setSelectedStep(index);
      setStepEditorOpen(true);
    }
  };

  const onApply = async () => {
    await props.onApply(macroId, wipMacro);
    await props.onClose();
  };

  const onMacroStepChange = async (stepIndex, step) => {
    const m = wipMacro.map((s, index) => {
      if (index == stepIndex) return step;
      return s;
    });
    setWipMacro(m);
  };

  useEffect(() => {
    if (wipMacro == null) setWipMacro(macro);
  });

  if (macroId == null) return null;
  if (wipMacro == null) return null;

  const steps = wipMacro.map((step, index) => {
    const key = "macro-step-" + index.toString();
    return (
      <MacroStep
        key={key}
        step={step}
        index={index}
        onDelete={onStepDelete}
        onClick={onStepSelect}
        selected={index == selectedStep}
      />
    );
  });

  return (
    <Stack
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <PageTitle title=": Macro Editor" />
      <Card
        sx={{
          my: 4,
          mx: "auto",
          width: "75%",
        }}
      >
        <CardHeader
          action={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
          title={`Macro #${macroId}`}
        />
        <CardContent>
          <Stack direction="row" flexWrap="wrap">
            {steps}
            <MacroStepAdd />
          </Stack>
        </CardContent>
        <CardActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button color="primary" onClick={onApply}>
            Apply
          </Button>
        </CardActions>
      </Card>
      <MacroStepEditor
        onChange={onMacroStepChange}
        stepIndex={selectedStep}
        step={wipMacro[selectedStep]}
        open={stepEditorOpen}
      />
    </Stack>
  );
};

export default MacroEditor;

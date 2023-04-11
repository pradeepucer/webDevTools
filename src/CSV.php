<?php

namespace webDevTools;

class CSV
{
    private $filename;
    private $delimiter;

    public function __construct($filename, $delimiter = ',')
    {
        $this->filename = $filename;
        $this->delimiter = $delimiter;
    }

    public function read()
    {
        $data = array();
        if (($handle = fopen($this->filename, 'r')) !== false) {
            while (($row = fgetcsv($handle, 0, $this->delimiter)) !== false) {
                $data[] = $row;
            }
            fclose($handle);
        }
        return $data;
    }
}

class dept:
    def __init__(self, name, roll):
        self.name = name
        self.roll = roll

    def year(self, year):
        self.year = year

gokul=dept("Gokul", "C1")
ram=dept("Ram", "C2")
gokul.year("II Year")
print(gokul.name, gokul.roll, gokul.year)